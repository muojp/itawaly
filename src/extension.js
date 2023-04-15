const { GObject, St, GLib, Gio } = imports.gi;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const CustomBatteryMenuItem = GObject.registerClass(
    class CustomBatteryMenuItem extends PanelMenu.Button {
        static SHELL_CMD = 'SmcDumpKey BCLM';
        static BATTERY_CHECK_INTERVAL = 60;

        async isSmcControlCommandAvailable() {
            const command = CustomBatteryMenuItem.SHELL_CMD.split(' ')[0];
            try {
                let [, stdout, stderr, status] = GLib.spawn_command_line_sync(`which ${command}`);
                return status === 0;
            }
            catch (error) {
                return false;
            }
        }

        async fetchBatteryChargeLevelMax() {
            const [success, output] = GLib.spawn_command_line_sync(CustomBatteryMenuItem.SHELL_CMD);
            if (!success || output === null) {
                console.error(`err`);
                throw new Error(`err`);
            }
            const outputLines = String.fromCharCode(...new Uint8Array(output)).trim().split('\n');
            const lastLine = outputLines[outputLines.length - 1];
            const regex = /data="(.{1})"/;
            const match = regex.exec(lastLine);
            if (match) {
                const data = match[1];
                const dataValue = data.charCodeAt(0);
                return dataValue;
            }
            else {
                throw new Error("Couldn't find the expected data format in the last line.");
            }
        }

        fetchBatteryPercentage() {
            let [ok, output] = GLib.spawn_command_line_sync('upower -e');
            if (!ok) {
                throw new Error('Failed to execute upower -e');
            }

            let devices = String.fromCharCode(...new Uint8Array(output));

            let batDevice = devices.split('\n').find(line => line.includes('BAT'));

            if (!batDevice) {
                throw new Error('No battery device found');
            }

            let [ok2, output2] = GLib.spawn_command_line_sync(`upower -i ${batDevice}`);
            if (!ok2) {
                throw new Error('Failed to execute upower -i');
            }

            let info = String.fromCharCode(...new Uint8Array(output2));
            let percentageLine = info.split('\n').find(line => line.includes('percentage'));
            if (!percentageLine) {
                throw new Error('No percentage line found');
            }

            let percentage = parseFloat(percentageLine.split(':')[1].trim().replace('%', ''));
            return Math.floor(percentage);
        }

        async setBatteryChargeLevelMax(level) {
            const setShellCmd = `${CustomBatteryMenuItem.SHELL_CMD} ${level}`;
            const [success, output] = GLib.spawn_command_line_sync(setShellCmd);
            if (!success || output === null) {
                throw new Error(`Error while setting new BCLM value.`);
            }
        }

        getSettings() {
            const schemaDir = GLib.build_filenamev([GLib.get_home_dir(), '.local/share/gnome-shell/extensions/bclm@muo.jp/schemas']);
            const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
                schemaDir,
                Gio.SettingsSchemaSource.get_default(),
                false
            );
            const schema = schemaSource.lookup('org.gnome.shell.extensions.bclm', false);
            return new Gio.Settings({ settings_schema: schema });
        }

        async initialize() {
            let box = new St.BoxLayout();

            let settings = this.getSettings();
            let isAutomatic = settings.get_boolean('automatic-control');

            let icon = new St.Icon({
                icon_name: 'power-profile-balanced-symbolic',
                style_class: 'system-status-icon'
            });

            box.add(icon);
            this.add_child(box);

            // Add a toggle menu item
            let toggleMenuItem = new PopupMenu.PopupSwitchMenuItem('Automatic', isAutomatic);
            this.menu.addMenuItem(toggleMenuItem);
            toggleMenuItem.connect('toggled', () => {
                isAutomatic = toggleMenuItem.state;
                settings.set_boolean('automatic-control', isAutomatic);
            });

            // Add separator
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            let menuItem1 = new PopupMenu.PopupMenuItem('Full charge');
            this.menu.addMenuItem(menuItem1);
            menuItem1.connect('activate', async () => {
                await this.setBatteryChargeLevelMax(100);
                Main.notify('Full charge activated');
                await updateDisplay();
            });

            let menuItem2 = new PopupMenu.PopupMenuItem('80%');
            this.menu.addMenuItem(menuItem2);
            menuItem2.connect('activate', async () => {
                await this.setBatteryChargeLevelMax(80);
                Main.notify('80% activated');
                await updateDisplay();
            });

            let menuItem3 = new PopupMenu.PopupMenuItem('40%');
            this.menu.addMenuItem(menuItem3);
            menuItem3.connect('activate', async () => {
                await this.setBatteryChargeLevelMax(40);
                Main.notify('40% activated');
                await updateDisplay();
            });

            let self = this;
            async function updateDisplay() {
                let clevel = await self.fetchBatteryChargeLevelMax();
                var selected = null;
                var iconId = null;
                if (clevel >= 100) {
                    selected = menuItem1;
                    iconId = 'performance';
                } else if (clevel <= 40) {
                    selected = menuItem3;
                    iconId = 'power-saver';
                } else {
                    selected = menuItem2;
                    iconId = 'balanced';
                }
                for (const menu of [menuItem1, menuItem2, menuItem3]) {
                    menu.setOrnament(menu === selected ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
                }
                icon.gicon = Gio.icon_new_for_string(`/usr/share/icons/Yaru/scalable/status/power-profile-${iconId}-symbolic.svg`);
            }

            this.handlerId = Mainloop.timeout_add_seconds(CustomBatteryMenuItem.BATTERY_CHECK_INTERVAL, async () => {
                if (!settings.get_boolean('automatic-control')) {
                    return true;
                }
                let batt = self.fetchBatteryPercentage();
                const LOWER_THRESHOLD = 45;
                const HIGHER_THRESHOLD = 80;
                if (batt <= LOWER_THRESHOLD || HIGHER_THRESHOLD <= batt) {
                    let clevel = await self.fetchBatteryChargeLevelMax();
                    if (clevel === 40 && batt <= LOWER_THRESHOLD) {
                        await this.setBatteryChargeLevelMax(85);
                    }
                    else if ((clevel === 100 && 95 <= batt) ||
                             (80 <= clevel && clevel < 100 && HIGHER_THRESHOLD <= batt)) {
                        await this.setBatteryChargeLevelMax(40);
                    }
                    else {
                        return true;
                    }
                    await updateDisplay();
                    Main.notify('BatteryChargeLevelMax updated.');
                }
                return true;
            });
            await updateDisplay();
        }

        _init() {
            super._init(0.0, "BCLM");
            this.initialize();
        }

        removeHandler() {
            if (this.handlerId != undefined) {
                Mainloop.source_remove(handlerId);
            }
        }
    }
);

let customBatteryMenuItem;

function init() {
    log('Battery Menu: Initializing');
}

function enable() {
    log('Battery Menu: Enabling');
    customBatteryMenuItem = new CustomBatteryMenuItem();
    Main.panel.addToStatusArea('customBatteryMenuItem', customBatteryMenuItem, 1, 'right');
}

function disable() {
    log('Battery Menu: Disabling');
    customBatteryMenuItem.removeHandler();
    customBatteryMenuItem.destroy();
}

