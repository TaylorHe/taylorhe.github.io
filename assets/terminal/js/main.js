"use strict";

/**
 * Configs
 */
var configs = (function () {
    var instance;
    var Singleton = function (options) {
        var options = options || Singleton.defaultOptions;
        for (var key in Singleton.defaultOptions) {
            this[key] = options[key] || Singleton.defaultOptions[key];
        }
    };
    Singleton.defaultOptions = {
        general_help: "Congrats on finding the help command!\nHere's a list of commands currently supported by this makeshift terminal.",
        ls_help: "List information about the files and folders.",
        cat_help: "Read file content and print it to the standard output.",
        whoami_help: "Who am I?",
        help_help: "Print this menu.",
        clear_help: "Clear the terminal screen.",
        reboot_help: "Restart.",
        vim_help: "Change the current working directory.",
        vi_help: "Move (rename) files.",
        emacs_help: "Remove files or directories.",
        welcome: "Welcome! Type 'help' to get started.",
        internet_explorer_warning: "Why are you using internet explorer? This doesn't work with IE. Get on Chrome or something.",
        invalid_command_message: "<value>: command not found.",
        permission_denied_message: "Unable to '<value>', permission denied.",
        sudo_message: "Nice try, but no.",
        usage: "Usage",
        file: "file",
        file_not_found: "File '<value>' not found.",
        username: "Username",
        value_token: "<value>",
        host: "he",
        user: "taylor",
        is_root: false,
        type_delay: 0
    };
    return {
        getInstance: function (options) {
            instance === void 0 && (instance = new Singleton(options));
            return instance;
        }
    };
})();

/**
 * Your files here
 */
var files = (function () {
    var instance;
    var Singleton = function (options) {
        var options = options || Singleton.defaultOptions;
        for (var key in Singleton.defaultOptions) {
            this[key] = options[key] || Singleton.defaultOptions[key];
        }
    };
    Singleton.defaultOptions = {
        "about.txt": "This page was made because I wanted to present my portfolio differently.",
        // "about.txt": "This website was made using only pure JavaScript with no extra libraries.\nI made it dynamic so anyone can use it, just download it from GitHub and change the config text according to your needs.\nIf you manage to find any bugs or security issues feel free to email me: luisbraganca@protonmail.com",
        // "getting_started.txt": "First, go to js/main.js and replace all the text on both singleton vars.\n- configs: All the text used on the website.\n- files: .\nAlso please notice if a file content is a raw URL, when clicked/concatenated it will be opened on a new tab.\nDon't forget also to:\n- Change the page title on the index.html file\n- Change the website color on the css/main.css\n- Change the images located at the img folder. The suggested sizes are 150x150 for the avatar and 32x32/16x16 for the favicon.",
        "contact.txt": "The best way to contact me is at:\ntaylor.he7@gmail.com",
        "linkedin.txt": "https://www.linkedin.com/in/taylorhe/",
    };
    return {
        getInstance: function (options) {
            instance === void 0 && (instance = new Singleton(options));
            return instance;
        }
    };
})();

var main = (function () {

    /**
     * Aux functions
     */
    var isUsingIE = window.navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);

    var ignoreEvent = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    
    var scrollToBottom = function () {
        let terminal = document.getElementById("terminal-container");
        console.log("scrolling to", terminal.scrollHeight);
        terminal.scrollTop = terminal.scrollHeight;
    };
    
    var isURL = function (str) {
        return (str.startsWith("http") || str.startsWith("www")) && str.indexOf(" ") === -1 && str.indexOf("\n") === -1;
    };
    
    /**
     * Model
     */
    var InvalidArgumentException = function (message) {
        this.message = message;
        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error) {
            Error.captureStackTrace(this, InvalidArgumentException);
        } else {
            this.stack = (new Error()).stack;
        }
    };
    // Extends Error
    InvalidArgumentException.prototype = Object.create(Error.prototype);
    InvalidArgumentException.prototype.name = "InvalidArgumentException";
    InvalidArgumentException.prototype.constructor = InvalidArgumentException;

    var Terminal = function (prompt, cmdLine, output, user, host, root, outputTimer) {
        if (!(prompt instanceof Node) || prompt.nodeName.toUpperCase() !== "DIV") {
            throw new InvalidArgumentException("Invalid value " + prompt + " for argument 'prompt'.");
        }
        if (!(cmdLine instanceof Node) || cmdLine.nodeName.toUpperCase() !== "INPUT") {
            throw new InvalidArgumentException("Invalid value " + cmdLine + " for argument 'cmdLine'.");
        }
        if (!(output instanceof Node) || output.nodeName.toUpperCase() !== "DIV") {
            throw new InvalidArgumentException("Invalid value " + output + " for argument 'output'.");
        }
       
        (typeof user === "string" && typeof host === "string") && (this.completePrompt = user + "@" + host + ":~" + (root ? "#" : "$"));
        this.prompt = prompt;
        this.cmdLine = cmdLine;
        this.output = output;

        this.typeSimulator = new TypeSimulator(outputTimer, output);
    };

    Terminal.prototype.type = function (text, callback, respectSpaces=true) {
        this.typeSimulator.type(text, callback, respectSpaces);
    };

    Terminal.prototype.exec = function () {
        var command = this.cmdLine.value;
        this.cmdLine.value = "";
        this.prompt.textContent = "";
        this.output.innerHTML += "<span class=\"prompt-color\">" + this.completePrompt + "</span> " + command + "<br/>";
    };

    Terminal.prototype.init = function () {

        this.cmdLine.disabled = true;

        this.lock();
        this.cmdLine.addEventListener("keydown", function (event) {
            if (event.which === 13 || event.keyCode === 13) {
                this.handleCmd();
                ignoreEvent(event);
            } else if (event.which === 9 || event.keyCode === 9) {
                this.handleFill();
                ignoreEvent(event);
            }
        }.bind(this));
        this.reset();
    };

    Terminal.makeElementDisappear = function (element) {
        element.style.opacity = 0;
        element.style.transform = "translateX(-300px)";
    };

    Terminal.makeElementAppear = function (element) {
        element.style.opacity = 1;
        element.style.transform = "translateX(0)";
    };


    Terminal.prototype.lock = function () {
        this.exec();
        // this.cmdLine.blur();
        // this.cmdLine.disabled = true;
    };

    Terminal.prototype.unlock = function () {
        this.cmdLine.disabled = false;
        this.prompt.textContent = this.completePrompt;
        scrollToBottom();
        this.focus();
    };

    Terminal.prototype.handleFill = function () {
        var cmdComponents = this.cmdLine.value.trim().split(" ");
        if ((cmdComponents.length <= 1) || (cmdComponents.length === 2 && cmdComponents[0] === cmds.CAT.value)) {
            this.lock();
            var possibilities = [];
            if (cmdComponents[0].toLowerCase() === cmds.CAT.value) {
                if (cmdComponents.length === 1) {
                    cmdComponents[1] = "";
                }
                for (var file in files.getInstance()) {
                    if (file.startsWith(cmdComponents[1].toLowerCase())) {
                        possibilities.push(cmds.CAT.value + " " + file);
                    }
                }
            } else {
                for (var command in cmds) {
                    if (cmds[command].value.startsWith(cmdComponents[0].toLowerCase())) {
                        possibilities.push(cmds[command].value);
                    }
                }
            }
            if (possibilities.length === 1) {
                this.cmdLine.value = possibilities[0] + " ";
                this.unlock();
            } else if (possibilities.length > 1) {
                this.type(possibilities.join("\n"), function () {
                    this.cmdLine.value = cmdComponents.join(" ");
                    this.unlock();
                }.bind(this));
            } else {
                this.cmdLine.value = cmdComponents.join(" ");
                this.unlock();
            }
            // scrollToBottom();
        }
    };

    var cmds = {
        COOL: { value: "cool", help: "Pretty cool, right?" },
        LS: { value: "ls", help: configs.getInstance().ls_help },
        CAT: { value: "cat", help: configs.getInstance().cat_help },
        WHOAMI: { value: "whoami", help: configs.getInstance().whoami_help },
        HELP: { value: "help", help: configs.getInstance().help_help },
        CLEAR: { value: "clear", help: configs.getInstance().clear_help },
        REBOOT: { value: "reboot", help: configs.getInstance().reboot_help },
        VI: { value: "vi", help: configs.getInstance().vi_help },
        VIM: { value: "vim", help: configs.getInstance().vim_help },
        EMACS: { value: "emacs", help: configs.getInstance().emacs_help },
        SUDO: { value: "sudo", help: configs.getInstance().sudo_help }
    };
    Terminal.prototype.handleCmd = function () {
        var cmdComponents = this.cmdLine.value.trim().split(" ");
        this.lock();
        // console.log("Checking ", cmdComponents[0]);
        try {
        switch (cmdComponents[0]) {
            case cmds.COOL.value:
                this.cool();
                break;
            case cmds.LS.value:
                this.ls();
                break;
            case cmds.CAT.value:
                this.cat(cmdComponents);
                break;            
            case cmds.WHOAMI.value:
                this.whoami();
                break;
            case cmds.HELP.value:
                this.help();
                break;
            case cmds.CLEAR.value:
                this.clear();
                break;
            case cmds.REBOOT.value:
                this.reboot();
                break;
            case cmds.VI.value:
                this.insultEditor("vi", "vim");
                break;
            case cmds.VIM.value:
                this.insultEditor("vim", "emacs");
                break;
            case cmds.EMACS.value:
                this.insultEditor("emacs", "vim");
                break;
            case cmds.SUDO.value:
                this.sudo();
                break;
            default:
                this.invalidCommand(cmdComponents);
                break;
        };
        } catch (e) {
            console.log("error", e)
            this.invalidCommand(cmdComponents);
        }
    };

    Terminal.prototype.cool = function () {
        this.type("I know right?", this.unlock.bind(this))
    }

    Terminal.prototype.insultEditor = function(currEditor, insteadEditor) {
        let disgusts = ["Yuck, ", "Eww, ", "Wow you use ", ""];
        let disgust = disgusts[Math.floor(Math.random()*disgusts.length)];
        disgust += (currEditor + "? Just use " + insteadEditor);
        this.type(disgust, this.unlock.bind(this));
    }
    Terminal.prototype.cat = function (cmdComponents) {
        var result;
        if (cmdComponents.length <= 1) {
            result = '<img src="/assets/img/derpcat.jpg" style="height: 250px;"/>';
            this.type(result, this.unlock.bind(this), false);
            return;
        } else if (!cmdComponents[1] || (!cmdComponents[1] === configs.getInstance().welcome_file_name || !files.getInstance().hasOwnProperty(cmdComponents[1]))) {
            result = configs.getInstance().file_not_found.replace(configs.getInstance().value_token, cmdComponents[1]);
        } else {
            result = cmdComponents[1] === configs.getInstance().welcome_file_name ? configs.getInstance().welcome : files.getInstance()[cmdComponents[1]];
        }
        this.type(result, this.unlock.bind(this));
    };

    Terminal.prototype.ls = function () {
        var result = ".\n..\n";
        for (var file in files.getInstance()) {
            result += file + "\n";
        }
        this.type(result.trim(), this.unlock.bind(this));
    };

    Terminal.prototype.sudo = function () {
        this.type(configs.getInstance().sudo_message, this.unlock.bind(this));
    }

    Terminal.prototype.whoami = function (cmdComponents) {
        var result =  "Name:      Taylor He" + "\n" 
                    + "Major:     Computer Science" + "\n"
                    + "School:    Stevens Tech Class of '19" + "\n"
                    + "Languages: C++  Python  TypeScript";
        this.type(result, this.unlock.bind(this));
    };

    Terminal.prototype.date = function (cmdComponents) {
        this.type(new Date().toString(), this.unlock.bind(this));
    };

    Terminal.prototype.help = function () {
        var result = configs.getInstance().general_help + "\n\n";
        let maxPerLine = 4;
        let counter = 0;
        for (var cmd in cmds) {
            result += cmds[cmd].value;
            // If not end
            if (counter != maxPerLine) {
                result += "  ";
            } else {
                counter = 0;
                result += "\n";
            }
            counter++;
            // result += cmds[cmd].value /*+ " - " + cmds[cmd].help*/ + "\n";
        }
        this.type(result.trim(), this.unlock.bind(this));
    };

    Terminal.prototype.clear = function () {
        this.output.textContent = "";
        this.prompt.textContent = "";
        this.prompt.textContent = this.completePrompt;
        this.unlock();
    };

    Terminal.prototype.reboot = function () {
        this.type("Rebooting", this.reset.bind(this));
    };

    Terminal.prototype.reset = function () {
        this.output.textContent = "";
        this.prompt.textContent = "";
        if (this.typeSimulator) {
            this.type(configs.getInstance().welcome + (isUsingIE ? "\n" + configs.getInstance().internet_explorer_warning : ""), function () {
                this.unlock();
            }.bind(this));
        }
    };

    Terminal.prototype.permissionDenied = function (cmdComponents) {
        this.type(configs.getInstance().permission_denied_message.replace(configs.getInstance().value_token, cmdComponents[0]), this.unlock.bind(this));
    };

    Terminal.prototype.invalidCommand = function (cmdComponents) {
        this.type(configs.getInstance().invalid_command_message.replace(configs.getInstance().value_token, cmdComponents[0]), this.unlock.bind(this));
    };

    Terminal.prototype.focus = function () {
        this.cmdLine.focus();
    };

    var TypeSimulator = function (timer, output) {
        var timer = parseInt(timer);
        if (timer === Number.NaN || timer < 0) {
            throw new InvalidArgumentException("Invalid value " + timer + " for argument 'timer'.");
        }
        if (!(output instanceof Node)) {
            throw new InvalidArgumentException("Invalid value " + output + " for argument 'output'.");
        }
        this.timer = timer;
        this.output = output;
    };

    TypeSimulator.prototype.type = function (text, callback, respectSpaces) {
        if (isURL(text)) {
            window.open(text);
        }
        // int i = 0;
        (function typer() {
            text = (text.replace(new RegExp("\n", 'g'), "<br/>"));
            if (respectSpaces) {
                text = (text.replace(/ /g, "&nbsp;"));
            }
            output.innerHTML += text + "<br/>";
            callback();
            scrollToBottom();
            return;
        })();
    };

    return {
        listener: function () {
            new Terminal(
                document.getElementById("prompt"),
                document.getElementById("cmdline"),
                document.getElementById("output"),
                configs.getInstance().user,
                configs.getInstance().host,
                configs.getInstance().is_root,
                configs.getInstance().type_delay
            ).init();
        }
    };
})();

window.onload = main.listener;
