// Put prefixes before console.* functions so that search is easier in cloudwatch logs.
export const bindLogPrefixes = (): void => {
  console.log = console.log.bind(null, '[LOG]');
  console.info = console.info.bind(null, '[INFO]');
  console.warn = console.warn.bind(null, '[WARN]');
  console.error = console.error.bind(null, '[ERROR]');
  console.debug = console.debug.bind(null, '[DEBUG]');
};
