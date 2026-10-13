const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Refuse dotenv command substitution before dotenv-expand can evaluate it.
 * Project .env files are configuration data and must not execute shell commands.
 *
 * @param {string} envPath
 */
module.exports = function loadSafeEnv(envPath) {
    if (!fs.existsSync(envPath)) {
        return {};
    }

    const parsed = dotenv.parse(fs.readFileSync(envPath));
    const unsafeKey = Object.entries(parsed).find(([, value]) =>
        value.includes('$(')
    )?.[0];
    const unsafeProcessKey = Object.entries(process.env).find(
        ([, value]) => typeof value === 'string' && value.includes('$(')
    )?.[0];

    if (unsafeKey || unsafeProcessKey) {
        const key = unsafeKey || unsafeProcessKey;
        throw new Error(
            `Command substitution is disabled in .env files for security. ` +
                `Remove $(...) from the ${key} variable before building (${envPath}).`
        );
    }

    for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }

    return parsed;
};
