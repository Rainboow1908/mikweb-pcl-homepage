# MikWeb PCL 主页

Mik Casual 服务器的 PCL 启动器自定义主页。

## 🎮 直接使用

在 PCL 中配置: **设置 → 个性化 → 主页 → 联网更新的下载地址**

```
https://rainboow1908.github.io/mikweb-pcl-homepage/Custom.xaml
```

## 🔧 动态版（实时数据）

如需实时在线玩家数、公告、封禁等数据，可自行部署 Node.js 服务器：

```bash
node server.js
```

PCL 填入: `http://localhost:38080/pcl-homepage.xaml`

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `38080` | 监听端口 |
| `API_BASE` | `https://mik.noctiro.moe/api` | MikWeb API 地址 |
| `SERVER_ADDR` | `noctiro.moe` | 显示的服务器地址 |

## 参考文档

- [PCL Wiki - 替换标记](https://github.com/Meloong-Git/PCL/wiki/%E6%9B%BF%E6%8D%A2%E6%A0%87%E8%AE%B0)
- [PCL Wiki - 自定义事件](https://github.com/Meloong-Git/PCL/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6)
