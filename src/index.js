const client = require('jscrambler').default;

class JscramblerPlugin {
  constructor (_options) {
    let options = _options;
    if (typeof options !== 'object' || Array.isArray(options)) options = {};
    this.options = options;

    this.processResult = this.processResult.bind(this);
  }

  apply (compiler) {
    const enable = this.options.enable || true;
    enable && compiler.plugin('emit', (compilation, callback) => {
      const sources = [];
      compilation.chunks.forEach((chunk) => {
        if (this.options.chunks && !this.options.chunks.includes(chunk.name)) {
          return;
        }

        chunk.files.forEach((filename) => {
          if (/\.(jsx?|map|html|htm)$/.test(filename)) {
            const content = compilation.assets[filename].source();

            sources.push({content, filename});
          }
        });
      });

      client.protectAndDownload(Object.assign(
        this.options,
        {
          sources,
          stream: false
        }
      ), res => this.processResult(res, compilation, callback));
    });
  }

  processResult (results, compilation, callback) {
    for (const result of results) {
      compilation.assets[result.filename] = {
        source () {
          return result.content;
        },
        size () {
          return result.content.length;
        }
      };
    }
    callback();
  }
}

module.exports = JscramblerPlugin;
