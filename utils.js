const util = require('node:util');
const execFile = util.promisify(require('node:child_process').execFile);

const probeStream = async (url) => {
  try {
    const { stdout, stderr } = await execFile('yt-dlp', ['-j', url]);
    const data = JSON.parse(stdout);
    return {
      data,
      stderr,
    };
  } catch (e) {
    console.error(e);
    if (e instanceof SyntaxError) {
      return {
        error: {
          message: String(e),
        },
      };
    }
    return {
      error: e,
    };
  }
};

module.exports = {
  probeStream,
};
