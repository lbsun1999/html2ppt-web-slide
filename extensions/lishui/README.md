# 丽水学院扩展模板

丽水版由北科科研母版生成，替换主题、校徽、校园图像及学校介绍，共用同一套编辑器与导出接口。它作为最新版Release的额外资源包提供，不维护长期独立代码分支。

- [下载丽水学院独立资源包](https://github.com/lbsun1999/html2ppt-web-slide/releases/latest/download/html2ppt-web-slide-lishui-v0.1.4.zip)
- [主项目与北科两套模板](../../README.md)
- 配置：[school-variants.js](../../src/school-variants.js)
- 素材：[assets/丽水学院](../../assets/丽水学院/)

主分支保留上述转换配置和素材，供复现及扩展其他学校；不重复保存丽水HTML和导出文件。开发时先安装依赖，执行：

```powershell
npm.cmd run build:lishui
# 服务启动后，同时生成PDF/PPTX：
npm.cmd run build:lishui -- --export
```

产物在`ect/lishui-release/`，基于当前北科科研HTML生成。正式包内HTML放在根目录，PDF/PPTX放在output，附带共用运行时与使用说明。用户修改过的丽水成稿请另存保留，重新构建是从北科母版生成新的学校版本。
