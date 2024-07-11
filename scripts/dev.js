// 打包packages下的模块，最终打包出js文件

import minimist from 'minimist'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'

const args = minimist(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url)  //import.meta.url是esm模块的url,file:格式的，加上fileurlToPath可以转成绝对路径  /xxx
const __dirname = dirname(__filename)  // dirname可以获取当前文件的目录
const require = createRequire(import.meta.url)//import.meta.url是esm模块的url,createRequire可以创建一个require函数
const target = args._[0] || 'reactivity'  //打包哪个项目
const format = args.f || 'iife' //打包成哪个格式

console.log("🚀 ~ args:", target, format)

// node 中esm模块没有__dirname
const entry = resolve(__dirname, '../packages', target, 'src', 'index.ts') //resolve可以拼接路径
console.log("🚀 ~ entry:", entry, require)
const pkg = require(`../packages/${target}/package.json`)

esbuild.context({
	entryPoints: [entry],
	outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), //出口
	bundle: true,
	platform: "browser",   //打包环境  给浏览器使用
	sourcemap: true, // 可以调试源代码
	format,
	globalName: pkg.buildOptions?.name
}).then((ctx) => {
	console.log("start dev")

	return ctx.watch()
})