import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

function run(command: string, projectRoot: string) {
    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
}

export default async function globalSetup() {
    const projectRoot = resolve(process.env.PLAYWRIGHT_LARAVEL_ROOT ?? '.');

    if (process.env.PLAYWRIGHT_SKIP_SETUP === 'true') {
        return;
    }

    const manifestPath = join(projectRoot, 'public', 'build', 'manifest.json');

    const shouldBuildAssets =
        process.env.PLAYWRIGHT_BUILD_ASSETS === 'true' ||
        (process.env.PLAYWRIGHT_SKIP_BUILD !== 'true' && !existsSync(manifestPath));

    if (shouldBuildAssets) {
        run('npm run build', projectRoot);
    }

    run('php artisan migrate --force', projectRoot);
    run('php artisan playwright:ensure-login-user', projectRoot);
}
