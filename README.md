# lightdm-theme-gradient

Prerequisities
- lightdm
- [web-greeter]()

**Installation**

1. Download the theme at `/usr/share/web-greeter/themes/gradient`
```bash
sudo git clone https://github.com/swwind/lightdm-theme-gradient /usr/share/web-greeter/themes/gradient
```

2. Configure `/etc/lightdm/web-greeter.yml`
```yaml
greeter:
    theme: gradient
```

3. Configure `/etc/lightdm/lightdm.conf`

```
greeter-session=web-greeter
```