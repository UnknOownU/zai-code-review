require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 295:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(857));
const utils_1 = __nccwpck_require__(507);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return (0, utils_1.toCommandValue)(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return (0, utils_1.toCommandValue)(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 391:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.platform = exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = exports.markdownSummary = exports.summary = exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(295);
const file_command_1 = __nccwpck_require__(210);
const utils_1 = __nccwpck_require__(507);
const os = __importStar(__nccwpck_require__(857));
const path = __importStar(__nccwpck_require__(928));
const oidc_utils_1 = __nccwpck_require__(109);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode || (exports.ExitCode = ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = (0, utils_1.toCommandValue)(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        return (0, file_command_1.issueFileCommand)('ENV', (0, file_command_1.prepareKeyValueMessage)(name, val));
    }
    (0, command_1.issueCommand)('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    (0, command_1.issueCommand)('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        (0, file_command_1.issueFileCommand)('PATH', inputPath);
    }
    else {
        (0, command_1.issueCommand)('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    if (options && options.trimWhitespace === false) {
        return inputs;
    }
    return inputs.map(input => input.trim());
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    const filePath = process.env['GITHUB_OUTPUT'] || '';
    if (filePath) {
        return (0, file_command_1.issueFileCommand)('OUTPUT', (0, file_command_1.prepareKeyValueMessage)(name, value));
    }
    process.stdout.write(os.EOL);
    (0, command_1.issueCommand)('set-output', { name }, (0, utils_1.toCommandValue)(value));
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    (0, command_1.issue)('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    (0, command_1.issueCommand)('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    (0, command_1.issueCommand)('error', (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    (0, command_1.issueCommand)('warning', (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    (0, command_1.issueCommand)('notice', (0, utils_1.toCommandProperties)(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    (0, command_1.issue)('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    (0, command_1.issue)('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    const filePath = process.env['GITHUB_STATE'] || '';
    if (filePath) {
        return (0, file_command_1.issueFileCommand)('STATE', (0, file_command_1.prepareKeyValueMessage)(name, value));
    }
    (0, command_1.issueCommand)('save-state', { name }, (0, utils_1.toCommandValue)(value));
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(766);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(766);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(651);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
/**
 * Platform utilities exports
 */
exports.platform = __importStar(__nccwpck_require__(867));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 210:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const crypto = __importStar(__nccwpck_require__(982));
const fs = __importStar(__nccwpck_require__(896));
const os = __importStar(__nccwpck_require__(857));
const utils_1 = __nccwpck_require__(507);
function issueFileCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${(0, utils_1.toCommandValue)(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueFileCommand = issueFileCommand;
function prepareKeyValueMessage(key, value) {
    const delimiter = `ghadelimiter_${crypto.randomUUID()}`;
    const convertedValue = (0, utils_1.toCommandValue)(value);
    // These should realistically never happen, but just in case someone finds a
    // way to exploit uuid generation let's not allow keys or values that contain
    // the delimiter.
    if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
    }
    if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
    }
    return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}
exports.prepareKeyValueMessage = prepareKeyValueMessage;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(170);
const auth_1 = __nccwpck_require__(595);
const core_1 = __nccwpck_require__(391);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                (0, core_1.debug)(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                (0, core_1.setSecret)(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 651:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(928));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 867:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDetails = exports.isLinux = exports.isMacOS = exports.isWindows = exports.arch = exports.platform = void 0;
const os_1 = __importDefault(__nccwpck_require__(857));
const exec = __importStar(__nccwpck_require__(485));
const getWindowsInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout: version } = yield exec.getExecOutput('powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Version"', undefined, {
        silent: true
    });
    const { stdout: name } = yield exec.getExecOutput('powershell -command "(Get-CimInstance -ClassName Win32_OperatingSystem).Caption"', undefined, {
        silent: true
    });
    return {
        name: name.trim(),
        version: version.trim()
    };
});
const getMacOsInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { stdout } = yield exec.getExecOutput('sw_vers', undefined, {
        silent: true
    });
    const version = (_b = (_a = stdout.match(/ProductVersion:\s*(.+)/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '';
    const name = (_d = (_c = stdout.match(/ProductName:\s*(.+)/)) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : '';
    return {
        name,
        version
    };
});
const getLinuxInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout } = yield exec.getExecOutput('lsb_release', ['-i', '-r', '-s'], {
        silent: true
    });
    const [name, version] = stdout.trim().split('\n');
    return {
        name,
        version
    };
});
exports.platform = os_1.default.platform();
exports.arch = os_1.default.arch();
exports.isWindows = exports.platform === 'win32';
exports.isMacOS = exports.platform === 'darwin';
exports.isLinux = exports.platform === 'linux';
function getDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.assign(Object.assign({}, (yield (exports.isWindows
            ? getWindowsInfo()
            : exports.isMacOS
                ? getMacOsInfo()
                : getLinuxInfo()))), { platform: exports.platform,
            arch: exports.arch,
            isWindows: exports.isWindows,
            isMacOS: exports.isMacOS,
            isLinux: exports.isLinux });
    });
}
exports.getDetails = getDetails;
//# sourceMappingURL=platform.js.map

/***/ }),

/***/ 766:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(857);
const fs_1 = __nccwpck_require__(896);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 625:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = void 0;
const fs_1 = __nccwpck_require__(896);
const os_1 = __nccwpck_require__(857);
class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        var _a, _b, _c;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if ((0, fs_1.existsSync)(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse((0, fs_1.readFileSync)(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                const path = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runAttempt = parseInt(process.env.GITHUB_RUN_ATTEMPT, 10);
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
        this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
        this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
        this.graphqlUrl =
            (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 923:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokit = exports.context = void 0;
const Context = __importStar(__nccwpck_require__(625));
const utils_1 = __nccwpck_require__(271);
exports.context = new Context.Context();
/**
 * Returns a hydrated octokit ready to use for GitHub Actions
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokit(token, options, ...additionalPlugins) {
    const GitHubWithPlugins = utils_1.GitHub.plugin(...additionalPlugins);
    return new GitHubWithPlugins((0, utils_1.getOctokitOptions)(token, options));
}
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map

/***/ }),

/***/ 827:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getApiBaseUrl = exports.getProxyFetch = exports.getProxyAgentDispatcher = exports.getProxyAgent = exports.getAuthString = void 0;
const httpClient = __importStar(__nccwpck_require__(170));
const undici_1 = __nccwpck_require__(134);
function getAuthString(token, options) {
    if (!token && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
    }
    else if (token && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
    }
    return typeof options.auth === 'string' ? options.auth : `token ${token}`;
}
exports.getAuthString = getAuthString;
function getProxyAgent(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgent(destinationUrl);
}
exports.getProxyAgent = getProxyAgent;
function getProxyAgentDispatcher(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgentDispatcher(destinationUrl);
}
exports.getProxyAgentDispatcher = getProxyAgentDispatcher;
function getProxyFetch(destinationUrl) {
    const httpDispatcher = getProxyAgentDispatcher(destinationUrl);
    const proxyFetch = (url, opts) => __awaiter(this, void 0, void 0, function* () {
        return (0, undici_1.fetch)(url, Object.assign(Object.assign({}, opts), { dispatcher: httpDispatcher }));
    });
    return proxyFetch;
}
exports.getProxyFetch = getProxyFetch;
function getApiBaseUrl() {
    return process.env['GITHUB_API_URL'] || 'https://api.github.com';
}
exports.getApiBaseUrl = getApiBaseUrl;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 271:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokitOptions = exports.GitHub = exports.defaults = exports.context = void 0;
const Context = __importStar(__nccwpck_require__(625));
const Utils = __importStar(__nccwpck_require__(827));
// octokit + plugins
const core_1 = __nccwpck_require__(717);
const plugin_rest_endpoint_methods_1 = __nccwpck_require__(299);
const plugin_paginate_rest_1 = __nccwpck_require__(528);
exports.context = new Context.Context();
const baseUrl = Utils.getApiBaseUrl();
exports.defaults = {
    baseUrl,
    request: {
        agent: Utils.getProxyAgent(baseUrl),
        fetch: Utils.getProxyFetch(baseUrl)
    }
};
exports.GitHub = core_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(exports.defaults);
/**
 * Convience function to correctly format Octokit Options to pass into the constructor.
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokitOptions(token, options) {
    const opts = Object.assign({}, options || {}); // Shallow clone - don't mutate the object provided by the caller
    // Auth
    const auth = Utils.getAuthString(token, opts);
    if (auth) {
        opts.auth = auth;
    }
    return opts;
}
exports.getOctokitOptions = getOctokitOptions;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 463:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chunkDiff = chunkDiff;
exports.estimateTokens = estimateTokens;
const core = __importStar(__nccwpck_require__(391));
/**
 * Maximum approximate character count per chunk (roughly ~4000 tokens).
 */
const DEFAULT_MAX_CHUNK_SIZE = 15000;
/**
 * Split a large diff into manageable chunks for AI processing.
 * Uses hunk boundaries for intelligent splitting.
 */
function chunkDiff(diffContent, maxChunkSize = DEFAULT_MAX_CHUNK_SIZE) {
    if (!diffContent || diffContent.length === 0) {
        return { chunks: [], wasSplit: false };
    }
    if (diffContent.length <= maxChunkSize) {
        return { chunks: [diffContent], wasSplit: false };
    }
    core.info(`Diff is large (${diffContent.length} chars), splitting into chunks...`);
    // Split by hunk boundaries (@@ ... @@)
    const hunks = splitIntoHunks(diffContent);
    // Group hunks into chunks that fit within maxChunkSize
    const chunks = [];
    let currentChunk = '';
    for (let i = 0; i < hunks.length; i++) {
        const hunk = hunks[i];
        if (currentChunk.length + hunk.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = hunk;
        }
        else {
            currentChunk += (currentChunk ? '\n' : '') + hunk;
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    // Handle case where a single hunk is larger than maxChunkSize
    const finalChunks = [];
    for (const chunk of chunks) {
        if (chunk.length > maxChunkSize) {
            const lineChunks = splitByLines(chunk, maxChunkSize);
            finalChunks.push(...lineChunks);
        }
        else {
            finalChunks.push(chunk);
        }
    }
    core.info(`Split diff into ${finalChunks.length} chunks.`);
    return { chunks: finalChunks, wasSplit: true };
}
/**
 * Split diff content into individual hunks.
 */
function splitIntoHunks(diffContent) {
    const hunks = [];
    const lines = diffContent.split('\n');
    let currentHunk = [];
    for (const line of lines) {
        if (line.startsWith('@@') && currentHunk.length > 0) {
            hunks.push(currentHunk.join('\n'));
            currentHunk = [];
        }
        currentHunk.push(line);
    }
    if (currentHunk.length > 0) {
        hunks.push(currentHunk.join('\n'));
    }
    return hunks.length > 0 ? hunks : [diffContent];
}
/**
 * Force-split content by lines when hunks are too large.
 */
function splitByLines(content, maxSize) {
    const chunks = [];
    const lines = content.split('\n');
    let currentChunk = '';
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxSize && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        currentChunk += (currentChunk ? '\n' : '') + line;
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}
/**
 * Estimate the number of tokens in a text string.
 * Rough approximation: 1 token ≈ 4 characters.
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}


/***/ }),

/***/ 158:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZaiClient = void 0;
const core = __importStar(__nccwpck_require__(391));
const https_1 = __importDefault(__nccwpck_require__(692));
const http_1 = __importDefault(__nccwpck_require__(611));
/**
 * Z.ai API Client with retry logic, timeout, and error handling.
 */
class ZaiClient {
    apiKey;
    baseUrl;
    model;
    maxRetries;
    timeout;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.model = config.model;
        this.maxRetries = config.maxRetries ?? 3;
        this.timeout = config.timeout ?? 60000;
    }
    async chatCompletion(messages, options) {
        const body = {
            model: this.model,
            messages,
            temperature: options?.temperature ?? 0.3,
            max_tokens: options?.maxTokens ?? 4096,
        };
        if (options?.responseFormat === 'json') {
            body.response_format = { type: 'json_object' };
        }
        const url = `${this.baseUrl}/api/coding/paas/v4/chat/completions`;
        const bodyStr = JSON.stringify(body);
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                core.debug(`API call attempt ${attempt}/${this.maxRetries} to ${url}`);
                const result = await this.makeHttpRequest(url, bodyStr);
                const response = JSON.parse(result);
                if (!response.choices || response.choices.length === 0) {
                    throw new Error('Empty response from API: no choices returned.');
                }
                const content = response.choices[0].message.content;
                core.debug(`API response received (${content.length} chars, ${response.usage?.total_tokens ?? 'unknown'} tokens)`);
                return content;
            }
            catch (error) {
                lastError = error;
                core.warning(`API call attempt ${attempt} failed: ${error.message}`);
                // Don't retry client errors (4xx) — they won't succeed on retry
                const is4xx = error.message?.match(/status\s+4\d{2}/);
                if (is4xx) {
                    throw error;
                }
                if (attempt < this.maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    core.info(`Retrying in ${delay}ms...`);
                    await sleep(delay);
                }
            }
        }
        throw new Error(`All ${this.maxRetries} API call attempts failed. Last error: ${lastError?.message}`);
    }
    /**
     * Make an HTTP request using Node.js built-in modules (no external deps needed).
     */
    makeHttpRequest(url, body) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            const transport = isHttps ? https_1.default : http_1.default;
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(body),
                    'User-Agent': 'zai-code-review-action/1.0.0',
                },
                timeout: this.timeout,
            };
            const req = transport.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk.toString();
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    }
                    else {
                        reject(new Error(`API returned status ${res.statusCode}: ${data.substring(0, 500)}`));
                    }
                });
            });
            req.on('error', (error) => {
                reject(new Error(`HTTP request error: ${error.message}`));
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timed out after ${this.timeout}ms`));
            });
            req.write(body);
            req.end();
        });
    }
}
exports.ZaiClient = ZaiClient;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/***/ }),

/***/ 94:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseFileReviewResponse = parseFileReviewResponse;
exports.parseSummaryResponse = parseSummaryResponse;
const core = __importStar(__nccwpck_require__(391));
/**
 * Parse the AI response for a file review.
 * Handles various formats: clean JSON, markdown-wrapped JSON, or plain text fallback.
 */
function parseFileReviewResponse(rawResponse) {
    const jsonStr = extractJson(rawResponse);
    if (jsonStr) {
        try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object') {
                const findings = [];
                if (Array.isArray(parsed.findings)) {
                    for (const f of parsed.findings) {
                        if (f && typeof f === 'object') {
                            findings.push({
                                line: typeof f.line === 'number' ? f.line : 1,
                                severity: normalizeSeverity(f.severity),
                                category: normalizeCategory(f.category),
                                title: String(f.title || 'Issue found'),
                                description: String(f.description || ''),
                                suggestion: f.suggestion ? String(f.suggestion) : undefined,
                            });
                        }
                    }
                }
                return { findings };
            }
        }
        catch (e) {
            core.warning(`Failed to parse JSON response: ${e.message}`);
        }
    }
    return parseFallbackResponse(rawResponse);
}
/**
 * Parse the AI response for a PR summary.
 */
function parseSummaryResponse(rawResponse) {
    const jsonStr = extractJson(rawResponse);
    if (jsonStr) {
        try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object') {
                return {
                    changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
                    attentionPoints: Array.isArray(parsed.attentionPoints) ? parsed.attentionPoints.map(String) : [],
                    verdict: normalizeVerdict(parsed.verdict),
                    summary: String(parsed.summary || ''),
                };
            }
        }
        catch (e) {
            core.warning(`Failed to parse summary JSON: ${e.message}`);
        }
    }
    return {
        changes: [],
        attentionPoints: [],
        verdict: 'comment',
        summary: rawResponse.substring(0, 500),
    };
}
/**
 * Extract JSON from a response that may be wrapped in markdown code blocks.
 */
function extractJson(response) {
    const trimmed = response.trim();
    // Case 1: Direct JSON object
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed;
    }
    // Case 2: JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return trimmed;
    }
    // Case 3: Markdown code block with json
    const jsonBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
        return jsonBlockMatch[1].trim();
    }
    // Case 4: Find first { ... } in the text
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return trimmed.substring(firstBrace, lastBrace + 1);
    }
    return null;
}
/**
 * Normalize severity values from various AI response formats.
 */
function normalizeSeverity(severity) {
    if (!severity)
        return 'info';
    const s = String(severity).toLowerCase().trim();
    if (['critical', 'error', 'high', 'blocker'].includes(s))
        return 'critical';
    if (['warning', 'medium', 'moderate'].includes(s))
        return 'warning';
    return 'info';
}
/**
 * Normalize category values from various AI response formats.
 */
function normalizeCategory(category) {
    if (!category)
        return 'improvement';
    const c = String(category).toLowerCase().trim();
    if (['bug', 'error', 'defect'].includes(c))
        return 'bug';
    if (['security', 'vulnerability', 'cve'].includes(c))
        return 'security';
    if (['performance', 'perf', 'optimization'].includes(c))
        return 'performance';
    if (['style', 'formatting', 'format'].includes(c))
        return 'style';
    if (['nit', 'minor', 'cosmetic'].includes(c))
        return 'nit';
    return 'improvement';
}
/**
 * Normalize verdict values.
 */
function normalizeVerdict(verdict) {
    if (!verdict)
        return 'comment';
    const v = String(verdict).toLowerCase().trim();
    if (['approve', 'approved', 'ok', 'good', 'pass'].includes(v))
        return 'approve';
    if (['request_changes', 'requestchanges', 'reject', 'rejected', 'fail', 'changes_requested'].includes(v))
        return 'request_changes';
    return 'comment';
}
/**
 * Fallback parser for non-JSON responses.
 * Tries to extract meaningful information from plain text.
 */
function parseFallbackResponse(rawResponse) {
    core.warning('Using fallback parser for non-JSON AI response.');
    // Try to find line-specific comments
    const findings = [];
    const lines = rawResponse.split('\n');
    let currentFinding = null;
    for (const line of lines) {
        // Look for patterns like "Line 42:" or "L42:" or ":42:"
        const lineMatch = line.match(/(?:line\s*|l|:)(\d+)/i);
        if (lineMatch) {
            if (currentFinding && currentFinding.description) {
                findings.push(currentFinding);
            }
            currentFinding = {
                line: parseInt(lineMatch[1], 10),
                severity: line.toLowerCase().includes('critical') || line.toLowerCase().includes('bug') ? 'critical' : 'warning',
                category: 'improvement',
                title: line.substring(0, 80),
                description: line,
            };
        }
        else if (currentFinding) {
            currentFinding.description = (currentFinding.description || '') + '\n' + line;
        }
    }
    if (currentFinding && currentFinding.description) {
        findings.push(currentFinding);
    }
    // If we couldn't extract any structured findings, create a single info finding
    if (findings.length === 0 && rawResponse.trim().length > 0) {
        findings.push({
            line: 1,
            severity: 'info',
            category: 'improvement',
            title: 'AI Review Feedback',
            description: rawResponse.substring(0, 1000),
        });
    }
    return { findings };
}


/***/ }),

/***/ 990:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDefaultSystemPrompt = getDefaultSystemPrompt;
exports.buildFileReviewPrompt = buildFileReviewPrompt;
exports.buildSummaryPrompt = buildSummaryPrompt;
exports.buildSummaryBody = buildSummaryBody;
const types_1 = __nccwpck_require__(829);
function getDefaultSystemPrompt(language) {
    const langInstruction = language === 'fr'
        ? 'Tu DOIS rédiger toutes tes réponses en français.'
        : 'You MUST write all responses in English.';
    return `You are Reviewer, an expert senior code reviewer specializing in identifying bugs, security vulnerabilities, and correctness issues in code diffs. Your primary function is to analyze changes and provide precise, actionable feedback that prevents defects from reaching production.

## Core Principles:

1. **Bug-First Mentality**: Prioritize correctness issues — logic errors, null risks, off-by-one mistakes, race conditions, and broken error handling.
2. **Evidence-Based**: Every finding MUST reference a specific line in the diff. Never speculate about code you cannot see.
3. **Signal Over Noise**: Only report genuine issues. A review with zero findings is a valid and valuable outcome.
4. **Minimal Scope**: Review ONLY the changed lines. Do not critique pre-existing code unless the change introduces a regression.
5. **Actionable Output**: Every finding must explain the concrete failure scenario — when, how, and under what inputs the bug manifests.

${langInstruction}

<review_guidelines>

## What to Look For (in priority order):

### Bugs (Primary Focus)
- Logic errors, incorrect conditionals, off-by-one mistakes
- Missing null/undefined/empty guards
- Incorrect error handling — swallowed errors, wrong error types, missing catch clauses
- Race conditions and async/await misuse
- Type mismatches that the type system does not catch

### Security
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication/authorization bypass
- Secrets or credentials in code
- Unsafe deserialization or eval usage

### Performance (only if obviously problematic)
- O(n²) or worse on unbounded input
- N+1 query patterns
- Blocking I/O on hot paths
- Memory leaks from uncleaned listeners/intervals

### Behavior Changes
- Unintentional changes to public API contracts
- Changed default values or return types
- Removed error handling that was previously present

</review_guidelines>

<severity_definitions>

- **critical**: Will cause runtime errors, data corruption, security vulnerabilities, or data loss in production. The code is broken.
- **warning**: Could lead to bugs under specific conditions, causes performance degradation, or creates maintainability risks. The code works but is fragile.
- **info**: Minor improvement suggestions, best practice recommendations, or readability enhancements. The code is correct but could be better.

</severity_definitions>

<category_definitions>

- **bug**: Logic errors, null pointer risks, incorrect algorithms, broken control flow
- **security**: Injection, auth bypass, secrets exposure, unsafe data handling
- **performance**: Algorithmic inefficiency, resource leaks, unnecessary allocations
- **improvement**: Better patterns, clearer error handling, improved readability
- **nit**: Minor naming, formatting, or code style issues
- **style**: Code style inconsistency with the rest of the codebase

</category_definitions>

<output_format>

You MUST respond with a single valid JSON object. No text before or after. No markdown code blocks wrapping the JSON.

{
  "findings": [
    {
      "line": 42,
      "severity": "critical",
      "category": "bug",
      "title": "Null dereference on empty response",
      "description": "When the API returns an empty array, response[0] is undefined. Accessing .id on undefined throws TypeError at runtime.",
      "suggestion": "if (!response.length) return null;"
    }
  ]
}

Field rules:
- \`line\`: 1-based line number relative to the diff chunk. MUST point to the exact line where the issue exists.
- \`severity\`: One of \`critical\`, \`warning\`, \`info\`. See <severity_definitions> above.
- \`category\`: One of \`bug\`, \`security\`, \`performance\`, \`improvement\`, \`nit\`, \`style\`. See <category_definitions> above.
- \`title\`: 3-10 word summary of the issue. Be specific — not "potential issue" but "null dereference on empty array".
- \`description\`: Explain the concrete failure scenario. State WHEN it breaks, WHAT input triggers it, and WHAT the impact is.
- \`suggestion\`: Optional. The replacement code snippet for GitHub's click-to-apply feature. ONLY the replacement lines — not the full file.

</output_format>

<non_negotiable_rules>

- ALWAYS respond with valid JSON. No text outside the JSON structure.
- NEVER wrap the JSON in markdown code blocks (no \`\`\`json or \`\`\`).
- NEVER flag style preferences as bugs. A \`let\` instead of \`const\` is not a bug.
- NEVER fabricate issues. If the code is correct, return \`{"findings": []}\`.
- NEVER review code outside the diff. Only the changed lines are in scope.
- ALWAYS specify the exact diff line number — not the file line number.
- ALWAYS explain the failure scenario in the description. "This could cause issues" is not acceptable — state the specific input, condition, or environment that triggers the failure.

</non_negotiable_rules>

<example>
Input diff:
\`\`\`diff
+function getUser(users, id) {
+  return users.find(u => u.id === id).name;
+}
\`\`\`

Good output:
{
  "findings": [
    {
      "line": 2,
      "severity": "critical",
      "category": "bug",
      "title": "Null dereference when user not found",
      "description": "Array.find() returns undefined when no element matches. Calling .name on undefined throws TypeError. This occurs whenever getUser is called with an id that does not exist in the array.",
      "suggestion": "  return users.find(u => u.id === id)?.name ?? null;"
    }
  ]
}
</example>

<example>
Input diff:
\`\`\`diff
+const result = items.map(i => i.value);
\`\`\`

Good output (no issues):
{"findings": []}
</example>

<example>
Bad output (DO NOT do this):
{
  "findings": [
    {
      "line": 1,
      "severity": "warning",
      "category": "style",
      "title": "Consider using destructuring",
      "description": "You could destructure the value property for cleaner code.",
      "suggestion": "const result = items.map(({ value }) => value);"
    }
  ]
}
Why this is bad: This is a style preference, not a real issue. The code is correct and readable. Return {"findings": []} instead.
</example>`;
}
function buildFileReviewPrompt(filePath, diffContent, customSystemPrompt, language) {
    const system = customSystemPrompt || getDefaultSystemPrompt(language);
    const user = `<review_request>
<file_path>${filePath}</file_path>

<diff>
${diffContent}
</diff>
</review_request>

Analyze the diff above for the file \`${filePath}\`. Focus on bugs, security vulnerabilities, and correctness issues in the changed lines only. Return your findings as a JSON object with line numbers relative to the diff chunk (1-based).`;
    return { system, user };
}
function buildSummaryPrompt(prTitle, filesSummary, allFindingsSummary, language) {
    const langInstruction = language === 'fr'
        ? 'Tu DOIS rédiger toutes tes réponses en français.'
        : 'You MUST write all responses in English.';
    const system = `You are Summarizer, an expert code reviewer that synthesizes file-level review findings into a concise pull request summary. ${langInstruction}

## Core Principles:

1. **Synthesis Over Repetition**: Distill individual file findings into high-level themes and patterns.
2. **Risk-Oriented**: Highlight what could go wrong and what needs immediate attention.
3. **Honest Verdict**: Base your verdict strictly on the severity of findings — not on how much code was changed.

<output_format>

You MUST respond with a single valid JSON object. No text before or after. No markdown code blocks.

{
  "changes": ["List of 3-7 main functional changes in this PR"],
  "attentionPoints": ["List of critical issues or risks that need immediate attention"],
  "verdict": "approve" | "request_changes" | "comment",
  "summary": "A 2-3 sentence overall assessment of the PR quality and readiness"
}

Field rules:
- \`changes\`: Describe WHAT changed functionally, not file-by-file diffs. Group related changes.
- \`attentionPoints\`: Only include items that require action. Empty array is valid if no critical issues exist.
- \`verdict\`: Use \`request_changes\` if there are critical bugs or security issues. Use \`comment\` if there are warnings worth noting. Use \`approve\` only if the code is clean.
- \`summary\`: Be direct and specific. Not "looks good" but "Adds OAuth2 login with proper token refresh, but the error handling in the callback needs work."

</output_format>

<non_negotiable_rules>

- ALWAYS respond with valid JSON. No text outside the JSON structure.
- NEVER wrap the JSON in markdown code blocks.
- NEVER inflate severity. If there are only minor suggestions, the verdict is \`approve\`, not \`comment\`.
- NEVER fabricate findings that were not reported in the file reviews.

</non_negotiable_rules>`;
    const fileList = filesSummary
        .map(f => `  - ${f.path} (+${f.additions}/-${f.deletions}, ${f.findingsCount} findings)`)
        .join('\n');
    const user = `<summary_request>
<pr_title>${prTitle}</pr_title>

<files_changed>
${fileList}
</files_changed>

<review_findings>
${allFindingsSummary || 'No issues found.'}
</review_findings>
</summary_request>

Synthesize the review findings above into a PR summary. Focus on overall themes and risks, not individual file details.`;
    return { system, user };
}
function buildSummaryBody(reviewerName, changes, attentionPoints, verdict, summary, criticalCount, securityCount, warningCount, suggestionCount) {
    const verdictEmoji = verdict === 'approve' ? '✅' : verdict === 'request_changes' ? '❌' : '💬';
    const verdictText = verdict === 'approve'
        ? 'Approved'
        : verdict === 'request_changes'
            ? 'Changes Requested'
            : 'Comment';
    let body = `## ${reviewerName} - Summary\n\n`;
    body += `| Category | Count |\n|---|---|\n`;
    body += `| Critical Bugs | ${criticalCount} |\n`;
    body += `| Security Issues | ${securityCount} |\n`;
    body += `| Warnings | ${warningCount} |\n`;
    body += `| Suggestions | ${suggestionCount} |\n\n`;
    if (summary) {
        body += `### Overview\n${summary}\n\n`;
    }
    if (changes.length > 0) {
        body += `### Changes\n`;
        for (const change of changes) {
            body += `- ${change}\n`;
        }
        body += '\n';
    }
    if (attentionPoints.length > 0) {
        body += `### Points of Attention\n`;
        for (const point of attentionPoints) {
            body += `- ${point}\n`;
        }
        body += '\n';
    }
    body += `### Verdict: **${verdictEmoji} ${verdictText}**\n\n`;
    body += `---\n*Powered by Z.ai*\n${types_1.REVIEW_MARKER}`;
    return body;
}


/***/ }),

/***/ 878:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseConfig = parseConfig;
const core = __importStar(__nccwpck_require__(391));
const github = __importStar(__nccwpck_require__(923));
function parseConfig() {
    const zaiApiKey = core.getInput('ZAI_API_KEY', { required: true });
    const zaiModel = core.getInput('ZAI_MODEL') || 'glm-4.7';
    const zaiBaseUrl = core.getInput('ai_base_url') || 'https://api.z.ai';
    const zaiSystemPrompt = core.getInput('ZAI_SYSTEM_PROMPT') || '';
    const reviewerName = core.getInput('ZAI_REVIEWER_NAME') || 'Z.ai Code Review';
    const githubToken = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN || '';
    const context = github.context;
    const repoOwner = context.repo.owner;
    const repoName = context.repo.repo;
    const pullNumber = context.payload.pull_request?.number ?? 0;
    const commitId = context.payload.pull_request?.head?.sha ?? '';
    const prTitle = context.payload.pull_request?.title ?? 'Pull Request';
    const maxFiles = parseInt(core.getInput('max_files') || '20', 10);
    const maxComments = parseInt(core.getInput('max_comments') || '50', 10);
    const excludePatternsRaw = core.getInput('exclude_patterns') ||
        'package-lock.json,yarn.lock,pnpm-lock.yaml,*.min.js,*.min.css,*.bundle.js,*.map';
    const excludePatterns = excludePatternsRaw
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    const language = core.getInput('language') || 'en';
    const autoApprove = (core.getInput('auto_approve') || 'false').toLowerCase() === 'true';
    if (!zaiApiKey) {
        throw new Error('ZAI_API_KEY is required but not provided.');
    }
    if (!githubToken) {
        throw new Error('GITHUB_TOKEN is required. Ensure your workflow has `pull-requests: write` permission.');
    }
    if (!repoOwner || !repoName) {
        throw new Error('Could not determine repository owner/name from GITHUB_REPOSITORY.');
    }
    if (!pullNumber || pullNumber === 0) {
        throw new Error('Could not determine pull request number. Ensure this action runs on a pull_request event.');
    }
    core.info(`Configuration loaded:`);
    core.info(`  Repository: ${repoOwner}/${repoName}`);
    core.info(`  PR Number: ${pullNumber}`);
    core.info(`  Model: ${zaiModel}`);
    core.info(`  Max files: ${maxFiles}`);
    core.info(`  Max comments: ${maxComments}`);
    core.info(`  Language: ${language}`);
    core.info(`  Auto-approve: ${autoApprove}`);
    core.info(`  Exclude patterns: ${excludePatterns.join(', ')}`);
    return {
        zaiApiKey,
        zaiModel,
        zaiBaseUrl,
        zaiSystemPrompt,
        reviewerName,
        githubToken,
        repoOwner,
        repoName,
        pullNumber,
        commitId,
        prTitle,
        maxFiles,
        maxComments,
        excludePatterns,
        language,
        autoApprove,
    };
}


/***/ }),

/***/ 97:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokit = getOctokit;
const core = __importStar(__nccwpck_require__(391));
const rest_1 = __nccwpck_require__(209);
let octokitInstance = null;
function getOctokit(token) {
    if (octokitInstance) {
        return octokitInstance;
    }
    core.info('Initializing GitHub Octokit client...');
    octokitInstance = new rest_1.Octokit({
        auth: token,
        userAgent: 'zai-code-review-action/1.0.0',
        request: {
            timeout: 30000,
        },
    });
    core.info('GitHub client initialized successfully.');
    return octokitInstance;
}


/***/ }),

/***/ 440:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.postInlineComment = postInlineComment;
exports.createReview = createReview;
exports.postSummaryComment = postSummaryComment;
exports.cleanOldComments = cleanOldComments;
const core = __importStar(__nccwpck_require__(391));
const types_1 = __nccwpck_require__(829);
/**
 * Post a single inline review comment on a specific line of a file.
 */
async function postInlineComment(octokit, owner, repo, pullNumber, commitId, comment) {
    try {
        const response = await octokit.pulls.createReviewComment({
            owner,
            repo,
            pull_number: pullNumber,
            body: formatCommentBody(comment),
            path: comment.path,
            line: comment.line,
            commit_id: commitId,
        });
        core.debug(`Posted inline comment on ${comment.path}:${comment.line} (id: ${response.data.id})`);
        return response.data.id;
    }
    catch (error) {
        // If line is out of range, try posting without line specification
        if (error.status === 422 || error.message?.includes('line')) {
            core.warning(`Could not post inline comment on ${comment.path}:${comment.line}: ${error.message}. Posting as body-only comment.`);
            try {
                const response = await octokit.pulls.createReviewComment({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    body: formatCommentBody({ ...comment, line: 0 }),
                    path: comment.path,
                    line: 1,
                    commit_id: commitId,
                });
                return response.data.id;
            }
            catch (innerError) {
                core.warning(`Failed to post fallback comment: ${innerError.message}`);
                return null;
            }
        }
        core.warning(`Failed to post inline comment on ${comment.path}:${comment.line}: ${error.message}`);
        return null;
    }
}
/**
 * Create a full review with all comments grouped together.
 * This is the preferred approach - similar to GitHub Copilot.
 */
async function createReview(octokit, owner, repo, pullNumber, commitId, comments, event, body) {
    try {
        const reviewComments = comments.map(c => ({
            path: c.path,
            line: c.line,
            body: formatCommentBody(c),
        }));
        const response = await octokit.pulls.createReview({
            owner,
            repo,
            pull_number: pullNumber,
            commit_id: commitId,
            body,
            event,
            comments: reviewComments,
        });
        core.info(`Created review (id: ${response.data.id}) with ${reviewComments.length} inline comments, event: ${event}`);
        return response.data.id;
    }
    catch (error) {
        core.warning(`Failed to create grouped review: ${error.message}. Falling back to individual comments.`);
        for (const comment of comments) {
            await postInlineComment(octokit, owner, repo, pullNumber, commitId, comment);
        }
        return null;
    }
}
/**
 * Post the global summary comment on the PR (as an issue comment).
 */
async function postSummaryComment(octokit, owner, repo, pullNumber, summaryBody) {
    try {
        const response = await octokit.issues.createComment({
            owner,
            repo,
            issue_number: pullNumber,
            body: summaryBody,
        });
        core.info(`Posted summary comment (id: ${response.data.id})`);
        return response.data.id;
    }
    catch (error) {
        core.warning(`Failed to post summary comment: ${error.message}`);
        return null;
    }
}
/**
 * Delete old review comments created by this action (identified by the marker).
 * This prevents duplicate comments on subsequent pushes.
 */
async function cleanOldComments(octokit, owner, repo, pullNumber) {
    core.info('Cleaning up old Z.ai review comments...');
    try {
        const allReviewComments = [];
        let reviewPage = 1;
        while (true) {
            const response = await octokit.pulls.listReviewComments({
                owner,
                repo,
                pull_number: pullNumber,
                per_page: 100,
                page: reviewPage,
            });
            allReviewComments.push(...response.data);
            if (response.data.length < 100)
                break;
            reviewPage++;
        }
        const oldComments = allReviewComments.filter((c) => c.body && c.body.includes(types_1.REVIEW_MARKER));
        for (const comment of oldComments) {
            try {
                await octokit.pulls.deleteReviewComment({
                    owner,
                    repo,
                    comment_id: comment.id,
                });
                core.debug(`Deleted old comment ${comment.id}`);
            }
            catch (err) {
                core.warning(`Failed to delete comment ${comment.id}: ${err.message}`);
            }
        }
        const allIssueComments = [];
        let issuePage = 1;
        while (true) {
            const response = await octokit.issues.listComments({
                owner,
                repo,
                issue_number: pullNumber,
                per_page: 100,
                page: issuePage,
            });
            allIssueComments.push(...response.data);
            if (response.data.length < 100)
                break;
            issuePage++;
        }
        const oldSummaryComments = allIssueComments.filter((c) => c.body && c.body.includes(types_1.REVIEW_MARKER));
        for (const comment of oldSummaryComments) {
            try {
                await octokit.issues.deleteComment({
                    owner,
                    repo,
                    comment_id: comment.id,
                });
                core.debug(`Deleted old summary comment ${comment.id}`);
            }
            catch (err) {
                core.warning(`Failed to delete summary comment ${comment.id}: ${err.message}`);
            }
        }
        if (oldComments.length > 0 || oldSummaryComments.length > 0) {
            core.info(`Cleaned ${oldComments.length} old review comments and ${oldSummaryComments.length} old summary comments.`);
        }
    }
    catch (error) {
        core.warning(`Failed to clean old comments: ${error.message}`);
    }
}
function formatCommentBody(comment) {
    const severityEmoji = {
        critical: '🔴',
        warning: '🟡',
        info: '🔵',
    };
    const categoryLabel = comment.category.toUpperCase();
    const severityLabel = comment.severity.toUpperCase();
    const emoji = severityEmoji[comment.severity] || 'ℹ️';
    let body = `## ${emoji} [${categoryLabel}] [${severityLabel}] ${comment.title}\n\n`;
    body += `${comment.description}\n`;
    if (comment.suggestion) {
        body += `\n\`\`\`suggestion\n${comment.suggestion}\n\`\`\`\n`;
    }
    body += `\n---\n*${types_1.REVIEW_MARKER}*\n`;
    return body;
}


/***/ }),

/***/ 333:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fetchPullRequestFiles = fetchPullRequestFiles;
exports.parseDiffHunks = parseDiffHunks;
exports.isFileExcluded = isFileExcluded;
exports.filterFiles = filterFiles;
const core = __importStar(__nccwpck_require__(391));
/**
 * Fetch all files changed in a pull request with pagination.
 */
async function fetchPullRequestFiles(octokit, owner, repo, pullNumber) {
    core.info(`Fetching PR files for ${owner}/${repo}#${pullNumber}...`);
    const files = [];
    let page = 1;
    const perPage = 100;
    while (true) {
        const response = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: perPage,
            page,
        });
        for (const file of response.data) {
            const isBinary = !file.patch && file.status !== 'removed';
            files.push({
                path: file.filename,
                diff: file.patch || '',
                hunks: isBinary ? [] : parseDiffHunks(file.patch || ''),
                additions: file.additions,
                deletions: file.deletions,
                isBinary,
                status: file.status,
                sha: file.sha ?? undefined,
            });
        }
        if (response.data.length < perPage) {
            break;
        }
        page++;
    }
    core.info(`Fetched ${files.length} files from PR.`);
    return files;
}
/**
 * Parse unified diff content into structured hunks with line mappings.
 */
function parseDiffHunks(diffContent) {
    if (!diffContent) {
        return [];
    }
    const hunks = [];
    const lines = diffContent.split('\n');
    let currentHunk = null;
    let newLineNum = 0;
    let oldLineNum = 0;
    let position = 0;
    for (const line of lines) {
        const hunkMatch = line.match(/^@@@? -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (hunkMatch) {
            if (currentHunk) {
                hunks.push(currentHunk);
            }
            const oldStart = parseInt(hunkMatch[1], 10);
            const newStart = parseInt(hunkMatch[3], 10);
            currentHunk = {
                oldStart,
                oldLines: parseInt(hunkMatch[2] || '1', 10),
                newStart,
                newLines: parseInt(hunkMatch[4] || '1', 10),
                content: '',
                lines: [],
            };
            oldLineNum = oldStart;
            newLineNum = newStart;
            position++;
            continue;
        }
        if (!currentHunk) {
            continue;
        }
        position++;
        currentHunk.content += (currentHunk.content ? '\n' : '') + line;
        let diffLine;
        if (line.startsWith('+')) {
            diffLine = {
                type: 'added',
                content: line.substring(1),
                position,
                newLineNumber: newLineNum,
            };
            newLineNum++;
        }
        else if (line.startsWith('-')) {
            diffLine = {
                type: 'removed',
                content: line.substring(1),
                position,
                oldLineNumber: oldLineNum,
            };
            oldLineNum++;
        }
        else if (line.startsWith(' ')) {
            diffLine = {
                type: 'context',
                content: line.substring(1),
                position,
                newLineNumber: newLineNum,
                oldLineNumber: oldLineNum,
            };
            newLineNum++;
            oldLineNum++;
        }
        else {
            diffLine = {
                type: 'context',
                content: line,
                position,
            };
        }
        currentHunk.lines.push(diffLine);
    }
    if (currentHunk) {
        hunks.push(currentHunk);
    }
    return hunks;
}
/**
 * Check if a file path matches any of the exclude patterns.
 * Supports glob-like patterns: *.ext, prefix/*, exact match.
 */
function isFileExcluded(filePath, excludePatterns) {
    for (const pattern of excludePatterns) {
        const trimmed = pattern.trim();
        if (!trimmed)
            continue;
        if (trimmed.startsWith('*.')) {
            if (filePath.endsWith(trimmed.substring(1))) {
                return true;
            }
        }
        else if (trimmed.endsWith('.*')) {
            const prefix = trimmed.slice(0, -1);
            const fileName = filePath.split('/').pop() || '';
            if (fileName.startsWith(prefix)) {
                return true;
            }
        }
        else if (trimmed.includes('*')) {
            const regexStr = '^' + trimmed
                .replace(/[.+^${}()|[\]\\]/g, '\\$&')
                .replace(/\*/g, '.*') + '$';
            const regex = new RegExp(regexStr, 'i');
            if (regex.test(filePath)) {
                return true;
            }
        }
        else {
            if (filePath === trimmed || filePath.endsWith('/' + trimmed)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Filter files based on exclude patterns and limit.
 */
function filterFiles(files, excludePatterns, maxFiles) {
    const filtered = files.filter(file => {
        if (file.isBinary) {
            core.debug(`Skipping binary file: ${file.path}`);
            return false;
        }
        if (!file.diff) {
            core.debug(`Skipping file with no diff: ${file.path}`);
            return false;
        }
        if (isFileExcluded(file.path, excludePatterns)) {
            core.debug(`Skipping excluded file: ${file.path}`);
            return false;
        }
        if (file.status === 'removed') {
            core.debug(`Skipping removed file: ${file.path}`);
            return false;
        }
        return true;
    });
    const limited = filtered.slice(0, maxFiles);
    if (limited.length < filtered.length) {
        core.info(`Limited files from ${filtered.length} to ${maxFiles} (max_files setting).`);
    }
    core.info(`Will review ${limited.length} files.`);
    return limited;
}


/***/ }),

/***/ 866:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(391));
const config_1 = __nccwpck_require__(878);
const client_1 = __nccwpck_require__(97);
const diff_1 = __nccwpck_require__(333);
const comments_1 = __nccwpck_require__(440);
const client_2 = __nccwpck_require__(158);
const reviewer_1 = __nccwpck_require__(244);
const summarizer_1 = __nccwpck_require__(714);
const types_1 = __nccwpck_require__(829);
async function run() {
    core.info('=== Z.ai Code Review Action Starting ===');
    const config = (0, config_1.parseConfig)();
    core.info('Configuration parsed successfully.');
    const octokit = (0, client_1.getOctokit)(config.githubToken);
    const aiClient = new client_2.ZaiClient({
        apiKey: config.zaiApiKey,
        baseUrl: config.zaiBaseUrl,
        model: config.zaiModel,
    });
    core.info('Cleaning up old review comments...');
    await (0, comments_1.cleanOldComments)(octokit, config.repoOwner, config.repoName, config.pullNumber);
    core.info('Fetching PR files...');
    const allFiles = await (0, diff_1.fetchPullRequestFiles)(octokit, config.repoOwner, config.repoName, config.pullNumber);
    if (allFiles.length === 0) {
        core.info('No files changed in this PR. Nothing to review.');
        await (0, comments_1.postSummaryComment)(octokit, config.repoOwner, config.repoName, config.pullNumber, `## ${config.reviewerName} - Summary\n\nNo files to review in this PR.\n\n---\n*Powered by Z.ai*\n<!-- zai-code-review-marker -->`);
        return;
    }
    core.info(`Found ${allFiles.length} files in PR.`);
    const filesToReview = (0, diff_1.filterFiles)(allFiles, config.excludePatterns, config.maxFiles);
    if (filesToReview.length === 0) {
        core.info('All files were filtered out. Nothing to review.');
        await (0, comments_1.postSummaryComment)(octokit, config.repoOwner, config.repoName, config.pullNumber, `## ${config.reviewerName} - Summary\n\nNo files to review after filtering (all files matched exclude patterns or were binary).\n\n---\n*Powered by Z.ai*\n<!-- zai-code-review-marker -->`);
        return;
    }
    core.info(`Starting code review of ${filesToReview.length} files...`);
    const fileReviews = await (0, reviewer_1.reviewFiles)(aiClient, filesToReview, config.zaiSystemPrompt, config.language, 3 // concurrency
    );
    const allComments = fileReviews
        .flatMap(r => r.comments)
        .sort((a, b) => {
        const severityOrder = { [types_1.Severity.Critical]: 0, [types_1.Severity.Warning]: 1, [types_1.Severity.Info]: 2 };
        return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    });
    const limitedComments = allComments.slice(0, config.maxComments);
    if (allComments.length > config.maxComments) {
        core.info(`Limited comments from ${allComments.length} to ${config.maxComments} (max_comments setting).`);
    }
    const prTitle = config.prTitle;
    const summary = await (0, summarizer_1.generateSummary)(aiClient, prTitle, fileReviews, config.reviewerName, config.language);
    if (limitedComments.length > 0) {
        core.info(`Creating review with ${limitedComments.length} inline comments...`);
        let reviewEvent = 'COMMENT';
        if (summary.verdict === types_1.ReviewVerdict.RequestChanges) {
            reviewEvent = 'REQUEST_CHANGES';
        }
        else if (summary.verdict === types_1.ReviewVerdict.Approve && config.autoApprove) {
            reviewEvent = 'APPROVE';
        }
        const reviewBody = summary.keyFindings.length > 0
            ? `## ${config.reviewerName}\n\n` +
                summary.keyFindings
                    .slice(0, 5)
                    .map(f => `- **[${f.severity.toUpperCase()}]** \`${f.filePath}:${f.line}\` - ${f.message}`)
                    .join('\n') +
                (summary.keyFindings.length > 5 ? `\n... and ${summary.keyFindings.length - 5} more findings.` : '')
            : `## ${config.reviewerName}\n\nReview complete. See inline comments for details.`;
        await (0, comments_1.createReview)(octokit, config.repoOwner, config.repoName, config.pullNumber, config.commitId, limitedComments, reviewEvent, reviewBody);
    }
    else {
        core.info('No issues found. Posting summary only.');
        // If no issues and auto_approve is enabled, approve the PR
        if (config.autoApprove) {
            try {
                await octokit.pulls.createReview({
                    owner: config.repoOwner,
                    repo: config.repoName,
                    pull_number: config.pullNumber,
                    commit_id: config.commitId,
                    body: `## ${config.reviewerName}\n\nNo issues found. LGTM! 👍`,
                    event: 'APPROVE',
                });
                core.info('PR approved (no issues found).');
            }
            catch (error) {
                core.warning(`Failed to approve PR: ${error.message}`);
            }
        }
    }
    await (0, comments_1.postSummaryComment)(octokit, config.repoOwner, config.repoName, config.pullNumber, summary.summaryText);
    core.info('=== Review Complete ===');
    core.info(`Files reviewed: ${fileReviews.length}`);
    core.info(`Comments posted: ${limitedComments.length}`);
    core.info(`Critical: ${summary.criticalCount} | Security: ${summary.securityCount} | Warnings: ${summary.warningCount} | Info: ${summary.suggestionCount}`);
    core.info(`Verdict: ${summary.verdict}`);
    core.setOutput('review_status', summary.verdict);
    core.setOutput('comments_count', limitedComments.length.toString());
    core.setOutput('critical_count', summary.criticalCount.toString());
    core.setOutput('security_count', summary.securityCount.toString());
    core.setOutput('warning_count', summary.warningCount.toString());
}
run().catch((error) => {
    core.error(`Fatal error: ${error.message}`);
    core.error(`Stack trace: ${error.stack}`);
    core.setFailed(`Z.ai Code Review failed: ${error.message}`);
});


/***/ }),

/***/ 244:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.reviewFile = reviewFile;
exports.reviewFiles = reviewFiles;
const core = __importStar(__nccwpck_require__(391));
const prompts_1 = __nccwpck_require__(990);
const parser_1 = __nccwpck_require__(94);
const chunker_1 = __nccwpck_require__(463);
const types_1 = __nccwpck_require__(829);
/**
 * Review a single file by sending its diff to the AI for analysis.
 * Handles chunking for large diffs and maps AI findings to proper line numbers.
 */
async function reviewFile(aiClient, file, customSystemPrompt, language) {
    core.info(`Reviewing file: ${file.path} (+${file.additions}/-${file.deletions})`);
    try {
        const { chunks, wasSplit } = (0, chunker_1.chunkDiff)(file.diff);
        const allFindings = [];
        for (let i = 0; i < chunks.length; i++) {
            if (wasSplit) {
                core.info(`  Processing chunk ${i + 1}/${chunks.length} for ${file.path}`);
            }
            const { system, user } = (0, prompts_1.buildFileReviewPrompt)(file.path, chunks[i], customSystemPrompt, language);
            const response = await aiClient.chatCompletion([
                { role: 'system', content: system },
                { role: 'user', content: user },
            ], { responseFormat: 'json' });
            const parsed = (0, parser_1.parseFileReviewResponse)(response);
            allFindings.push(...parsed.findings);
        }
        const comments = mapFindingsToComments(file, allFindings);
        core.info(`  Found ${comments.length} issues in ${file.path}`);
        return {
            path: file.path,
            comments,
            additions: file.additions,
            deletions: file.deletions,
        };
    }
    catch (error) {
        core.warning(`Error reviewing file ${file.path}: ${error.message}`);
        return {
            path: file.path,
            comments: [],
            additions: file.additions,
            deletions: file.deletions,
            error: error.message,
        };
    }
}
/**
 * Review multiple files in parallel with limited concurrency.
 */
async function reviewFiles(aiClient, files, customSystemPrompt, language, concurrency = 3) {
    core.info(`Starting review of ${files.length} files with concurrency ${concurrency}...`);
    const results = [];
    const queue = [...files];
    async function processQueue() {
        while (queue.length > 0) {
            const file = queue.shift();
            if (!file)
                break;
            const result = await reviewFile(aiClient, file, customSystemPrompt, language);
            results.push(result);
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => processQueue());
    await Promise.all(workers);
    const totalComments = results.reduce((sum, r) => sum + r.comments.length, 0);
    const errors = results.filter(r => r.error).length;
    core.info(`Review complete: ${totalComments} comments across ${results.length} files (${errors} errors)`);
    return results;
}
/** AI returns line numbers relative to the diff chunk; these must be mapped
 * to actual file line numbers for GitHub's inline comment API. */
function mapFindingsToComments(file, findings) {
    const comments = [];
    for (const finding of findings) {
        const lineNumber = resolveLineNumber(file, finding.line);
        const comment = {
            path: file.path,
            line: lineNumber,
            body: '', // Will be formatted by comments.ts
            severity: normalizeSeverityEnum(finding.severity),
            category: normalizeCategoryEnum(finding.category),
            title: finding.title,
            description: finding.description,
            suggestion: finding.suggestion,
        };
        comments.push(comment);
    }
    return comments;
}
function resolveLineNumber(file, diffLineNum) {
    if (diffLineNum <= 0) {
        return 1;
    }
    let currentDiffLine = 0;
    for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
            currentDiffLine++;
            if (currentDiffLine === diffLineNum) {
                if (line.type === 'added' || line.type === 'context') {
                    return line.newLineNumber || hunk.newStart;
                }
                // For removed lines, use the next context/added line
                return line.oldLineNumber || hunk.oldStart;
            }
        }
    }
    return 1;
}
function normalizeSeverityEnum(severity) {
    switch (severity) {
        case 'critical': return types_1.Severity.Critical;
        case 'warning': return types_1.Severity.Warning;
        case 'info': return types_1.Severity.Info;
        default: return types_1.Severity.Info;
    }
}
function normalizeCategoryEnum(category) {
    switch (category) {
        case 'bug': return types_1.Category.Bug;
        case 'security': return types_1.Category.Security;
        case 'improvement': return types_1.Category.Improvement;
        case 'nit': return types_1.Category.Nit;
        case 'performance': return types_1.Category.Performance;
        case 'style': return types_1.Category.Style;
        default: return types_1.Category.Improvement;
    }
}


/***/ }),

/***/ 714:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateSummary = generateSummary;
const core = __importStar(__nccwpck_require__(391));
const prompts_1 = __nccwpck_require__(990);
const parser_1 = __nccwpck_require__(94);
const types_1 = __nccwpck_require__(829);
async function generateSummary(aiClient, prTitle, fileReviews, reviewerName, language) {
    core.info('Generating PR summary...');
    let criticalCount = 0;
    let securityCount = 0;
    let warningCount = 0;
    let suggestionCount = 0;
    const keyFindings = [];
    for (const review of fileReviews) {
        for (const comment of review.comments) {
            switch (comment.severity) {
                case types_1.Severity.Critical:
                    criticalCount++;
                    break;
                case types_1.Severity.Warning:
                    warningCount++;
                    break;
                case types_1.Severity.Info:
                    suggestionCount++;
                    break;
            }
            if (comment.category === types_1.Category.Security) {
                securityCount++;
            }
            if (comment.severity === types_1.Severity.Critical || comment.category === types_1.Category.Security) {
                keyFindings.push({
                    severity: comment.severity,
                    category: comment.category,
                    filePath: comment.path,
                    line: comment.line,
                    message: comment.title,
                });
            }
        }
    }
    const filesSummary = fileReviews.map(r => ({
        path: r.path,
        additions: r.additions ?? 0,
        deletions: r.deletions ?? 0,
        findingsCount: r.comments.length,
    }));
    const findingsText = keyFindings
        .map(f => `[${f.severity}][${f.category}] ${f.filePath}:${f.line} - ${f.message}`)
        .join('\n');
    const { system, user } = (0, prompts_1.buildSummaryPrompt)(prTitle, filesSummary, findingsText, language);
    let summaryText = '';
    let changes = [];
    let attentionPoints = [];
    let verdictStr = 'comment';
    try {
        const response = await aiClient.chatCompletion([
            { role: 'system', content: system },
            { role: 'user', content: user },
        ], { responseFormat: 'json' });
        const parsed = (0, parser_1.parseSummaryResponse)(response);
        changes = parsed.changes;
        attentionPoints = parsed.attentionPoints;
        verdictStr = parsed.verdict;
        summaryText = parsed.summary;
    }
    catch (error) {
        core.warning(`Failed to generate AI summary: ${error.message}. Using fallback.`);
        summaryText = `Reviewed ${fileReviews.length} files. Found ${criticalCount} critical issues, ${securityCount} security issues, ${warningCount} warnings, and ${suggestionCount} suggestions.`;
    }
    const verdict = determineVerdict(criticalCount, securityCount, warningCount, verdictStr);
    const formattedBody = (0, prompts_1.buildSummaryBody)(reviewerName, changes, attentionPoints, verdictStr, summaryText, criticalCount, securityCount, warningCount, suggestionCount);
    return {
        criticalCount,
        securityCount,
        warningCount,
        suggestionCount,
        keyFindings,
        verdict,
        summaryText: formattedBody,
    };
}
function determineVerdict(criticalCount, securityCount, warningCount, aiVerdict) {
    // Critical bugs or security issues always require changes
    if (criticalCount > 0 || securityCount > 0) {
        return types_1.ReviewVerdict.RequestChanges;
    }
    // Respect AI verdict if reasonable
    if (aiVerdict === 'request_changes') {
        return types_1.ReviewVerdict.RequestChanges;
    }
    // Warnings -> comment
    if (warningCount > 0) {
        return types_1.ReviewVerdict.Comment;
    }
    // All clean -> approve
    return types_1.ReviewVerdict.Approve;
}


/***/ }),

/***/ 829:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_DIFF_SIZE = exports.REVIEW_MARKER = exports.ReviewVerdict = exports.Category = exports.Severity = void 0;
/**
 * Severity levels for review findings.
 */
var Severity;
(function (Severity) {
    Severity["Critical"] = "critical";
    Severity["Warning"] = "warning";
    Severity["Info"] = "info";
})(Severity || (exports.Severity = Severity = {}));
/**
 * Categories of review feedback.
 */
var Category;
(function (Category) {
    Category["Bug"] = "bug";
    Category["Security"] = "security";
    Category["Improvement"] = "improvement";
    Category["Nit"] = "nit";
    Category["Performance"] = "performance";
    Category["Style"] = "style";
})(Category || (exports.Category = Category = {}));
/**
 * Overall verdict for the review.
 */
var ReviewVerdict;
(function (ReviewVerdict) {
    ReviewVerdict["Approve"] = "APPROVE";
    ReviewVerdict["RequestChanges"] = "REQUEST_CHANGES";
    ReviewVerdict["Comment"] = "COMMENT";
})(ReviewVerdict || (exports.ReviewVerdict = ReviewVerdict = {}));
/**
 * Marker used to identify comments created by this action.
 */
exports.REVIEW_MARKER = '<!-- zai-code-review-marker -->';
/**
 * Maximum diff size in characters before chunking is applied.
 */
exports.MAX_DIFF_SIZE = 15000;


/***/ }),

/***/ 485:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 170:
/***/ ((module) => {

module.exports = eval("require")("@actions/http-client");


/***/ }),

/***/ 595:
/***/ ((module) => {

module.exports = eval("require")("@actions/http-client/lib/auth");


/***/ }),

/***/ 717:
/***/ ((module) => {

module.exports = eval("require")("@octokit/core");


/***/ }),

/***/ 528:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-paginate-rest");


/***/ }),

/***/ 812:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-request-log");


/***/ }),

/***/ 299:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-rest-endpoint-methods");


/***/ }),

/***/ 134:
/***/ ((module) => {

module.exports = eval("require")("undici");


/***/ }),

/***/ 982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 611:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 692:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 857:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 209:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  Octokit: () => (/* binding */ Octokit)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/@vercel+ncc@0.38.4/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/core
var core = __nccwpck_require__(717);
// EXTERNAL MODULE: ./node_modules/.pnpm/@vercel+ncc@0.38.4/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/plugin-request-log
var plugin_request_log = __nccwpck_require__(812);
// EXTERNAL MODULE: ./node_modules/.pnpm/@vercel+ncc@0.38.4/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/plugin-paginate-rest
var plugin_paginate_rest = __nccwpck_require__(528);
// EXTERNAL MODULE: ./node_modules/.pnpm/@vercel+ncc@0.38.4/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/plugin-rest-endpoint-methods
var plugin_rest_endpoint_methods = __nccwpck_require__(299);
;// CONCATENATED MODULE: ./node_modules/@octokit/rest/dist-src/version.js
const VERSION = "22.0.1";


;// CONCATENATED MODULE: ./node_modules/@octokit/rest/dist-src/index.js





const Octokit = core.Octokit.plugin(plugin_request_log.requestLog, plugin_rest_endpoint_methods.legacyRestEndpointMethods, plugin_paginate_rest.paginateRest).defaults(
  {
    userAgent: `octokit-rest.js/${VERSION}`
  }
);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(866);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map