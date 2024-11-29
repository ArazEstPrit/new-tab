import { build, context } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

const buildParams = {
	entryPoints: ["src/index.ts", "src/styles/index.scss"],
	bundle: true,
	target: "chrome58",
	outdir: "dist/",
	plugins: [sassPlugin()],
};

if (process.argv.includes("--watch")) {
	(await context(buildParams)).watch();
} else {
	build(buildParams);
}
