# Itawaly - Control MacBooks' BCLM (Battery Charge Level Max) for Ubuntu / GNOME Desktop

## Introduction

By installing Itawaly, you can control your MacBook's battery charge level max (BCLM) to maintain your battery in good condition longer.

![menu](https://github.com/muojp/itawaly/blob/images/menu.png)

 - You can manually set BCLM to 40% / 80% / 100%.
 - You can enable automatic BCLM management.
   - In automatic mode, charge-level is controlled by 40-80% rule; charges up to around 80% then discharge until around 40% to reduce intermittent recharging.
   - When in automatic mode, you can still setup a single time full-charge manually which charges up to around 95%. This is designed to be used before you are getting ready for a longer trip.

![manual 100%-charge](https://github.com/muojp/itawaly/blob/images/full-charge.png)

![charge-finished](https://github.com/muojp/itawaly/blob/images/finished-charging.png)

## Prerequisites

`SmcDumpKey` command is installed w/ setuid flag.

If not yet, run `./smc_dump_key.sh`.

## Install

1. Run install script to install GNOME Shell Extension.

```
./install.sh
```

2. Log out & Log in again.

3. Enable installed extension.

```
gnome-extensions enable bclm@muo.jp
```

4. Log out & Log in again.

## Remove older versions / Uninstall

```
gnome-extensions uninstall bclm@muo.jp
```


## Why Itawaly?

To maintain our batteries condition better.

Q. What is the recommended charge level for storing lithium-ion batteries, and why?

A. The recommended charge level for storing lithium-ion batteries for an extended period is generally between 40% and 60%. The reasons for this are as follows:

1. Stress reduction: When a battery is stored at full charge (100%) or completely discharged (0%) for a long time, different stresses are applied, accelerating battery degradation. By maintaining the charge level between 40% and 60%, stress can be minimized.

2. Voltage stabilization: The voltage of a lithium-ion battery changes with its charge level. High charge levels result in high voltage, and low charge levels result in low voltage. Storing a battery at high voltage for a long time accelerates the internal chemical reactions, leading to faster degradation. Conversely, storing a battery at low voltage for an extended period increases the risk of over-discharge due to self-discharge. By maintaining a charge level between 40% and 60%, the battery can be kept stable within an appropriate voltage range.

3. Capacity retention: By storing the battery at an appropriate charge level, there is a higher probability of maintaining its capacity. As overcharging and over-discharging-induced degradation are suppressed, the battery's performance is more likely to be maintained even after long-term storage.

For these reasons, it is recommended to keep the charge level of lithium-ion batteries between 40% and 60% when storing them for a long period. Additionally, the temperature and humidity of the storage location also affect battery life, so it is essential to store the batteries under appropriate environmental conditions. A cool and low-humidity location is considered ideal.

By ChatGPT.

## What does it mean, `itawaly`?

The software name "Itawaly" was inspired by the Japanese word "itawari," from which it derives its name.

Itawari is a Japanese concept that refers to the attitude of perceiving the emotional and physical pain or distress of others, valuing their well-being, and providing appropriate support and assistance. It is characterized by respecting the feelings and positions of others and responding with an encompassing gentleness. Practicing itawari enhances communication and empathy skills, leading to better relationships. Moreover, itawari is applicable not only to oneself but also to others and the environment, with its expression varying depending on the situation and culture. By embracing itawari, one can deepen bonds with others while also improving their own spirituality, leading to a more fulfilling life.

