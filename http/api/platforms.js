initializePlatforms();

function initializePlatforms() {
	var platforms = {
		java: {highlight: javaHighlight, id: 'java', typePrefix: '', label: 'Java'},
		javascript: {highlight: javascriptHighlight, id: 'javascript', typePrefix: '', label: 'Javascript'},
		perl: {highlight: perlHighlight, id: 'perl', typePrefix: 'CN::', label: 'Perl'},
		swift: {highlight: swiftHighlight, id: 'swift', typePrefix: '', label: 'Swift'},
		//python: {highlight: pythonHighlight},
		//csharp: {highlight: csharpHighlight},
		//vala: {highlight: valaHighlight},
		//c: {highlight: cHighlight},
		//php: {highlight: phpHighlight}
		};

	var main = document.getElementsByClassName('main')[0];

	var platformList = document.getElementById('platforms'); // document.createElement('div');
	//platformList.className = 'platform';
	//main.insertBefore(platformList, main.firstChild);
	for (var id in platforms) addPlatform(platforms[id]);

	function addPlatform(platform) {
		platform.element = document.createElement('span');
		platformList.appendChild(platform.element);
		platform.element.innerHTML = platform.label;
		platform.element.onclick = platform.element.ontouchstart = function() { select(platform); };
		setDisplay(platform.id, 'none');
	}

	// State
	var selected = null;
	select(platforms[localStorage.getItem('platform')] || platforms.java);

	function select(platform) {
		if (selected != null) {
			setDisplay(selected.id, 'none');
			selected.element.classList.remove('selected');
		}

		console.log(selected, platform);
		selected = platform;

		if (selected != null) {
			setDisplay(selected.id, '');
			selected.element.classList.add('selected');
			localStorage.setItem('platform', selected.id);
		}
	}

	function setDisplay(className, value) {
		var elements = main.getElementsByClassName(className);

		// Display
		for (var n = 0; n < elements.length; n++)
			elements[n].style.display = value;

		// Apply syntax highlighting
		var platform = platforms[className];
		if (! platform) return;
		if (! platform.highlight) return;
		if (platform.highlighted) return;
		platform.highlighted = true;
		for (var n = 0; n < elements.length; n++) {
			for (var child = elements[n].firstElementChild; child; child = child.nextElementSibling)
				if (child.tagName == 'PRE') platform.highlight(child);
		}
	}

	function javaHighlight(element) {
		var text = '';
		var tokens = prepareInput(element.innerHTML).split(/(\s+|[\.,;&<>\|\[\]\(\)\+\*-]+|".*?"|\/\/.*?\n|\/=?)/);
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var tokenN = tokens[i + 1] || '';
			var tokenP = tokens[i - 1] || '';
			var tokenPP = tokens[i - 2] || '';

			if (token.match(/^[a-z]/)) {
				if (tokenN.match(/^\(/)) {
					token = span(token, 'op');
				} else if (token == 'boolean' || token == 'long' || token == 'int' || token == 'short' || token == 'byte' || token == 'char' || token == 'void') {
					token = spanOrA(token, 'type');
				} else if (token == 'final' || token == 'public' || token == 'private' || token == 'class' || token == 'interface' || token == 'extends' || token == 'implements') {
				} else if (token == 'if' || token == 'else' || token == 'return' || token == 'for' || token == 'while') {
					token = span(token, 'control');
				} else if (token == 'new') {
					token = span(token, 'op');
				} else if (token.match(/_$/)) {
					token = spanOrA(token.substr(0, token.length - 1), 'm');
				} else {
					token = spanOrA(token, 'im');
				}
			} else if (token.match(/^[A-Z0-9]+$/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^[A-Z]/)) {
				token = spanOrA(token, 'type');
			} else if (token.match(/^"/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^\/\//)) {
				var match = token.match(/^(.*?)(\n*)$/);
				token = span(match[1], 'comment') + match[2];
			} else if (token.match(/^\[\]/)) {
				token = span('[]', 'type') + token.substr(2);
			} else if (token.match(/^@/)) {
				token = span(token, 'annotation');
			}

			var semicolon = token.match(/^(.*);(\s*)$/);
			if (semicolon)
				token = semicolon[1] + '<span style="opacity:0.2">;</span>' + semicolon[2];
			else if (token == '>') token = '&gt;';
			else if (token == '<') token = '&lt;';

			text += token;
		}

		element.innerHTML = prepareFinal(text);

		function spanOrA(token, className) {
			return genericSpanOrA(token, className, '', platforms.java);
		}
	}

	function perlHighlight(element) {
		var text = '';
		var tokens = prepareInput(element.innerHTML).split(/(\/.*?[^\\]\/|\s+|[\.,;&<>\|\[\]\(\)\+\*\/=-]+|'.*?'|#.*?\n)/);
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var tokenN = tokens[i + 1] || '';
			var tokenP = tokens[i - 1] || '';
			var tokenPP = tokens[i - 2] || '';

			if (token.match(/^\$[a-z]/)) {
				token = genericSpanOrA(token.substr(1), 'im', '$', platforms.perl);
			} else if (token.match(/^\$[0-9]/)) {
				token = genericSpanOrA(token.substr(1), 'm', '$', platforms.perl);
			} else if (token.match(/^\@[a-z]/)) {
				token = genericSpanOrA(token.substr(1), 'im', '@', platforms.perl);
			} else if (token.match(/^\@\$[a-z]/)) {
				token = genericSpanOrA(token.substr(2), 'im', '@$', platforms.perl);
			} else if (token.match(/^\%\$[a-z]/)) {
				token = genericSpanOrA(token.substr(2), 'im', '%$', platforms.perl);
			} else if (token.match(/^[a-z]/)) {
				if (token == 'sub' || tokenPP == 'sub' && tokenP == ' ' || token == 'package') {
					token = span(token, 'definition');
				} else if (token == 'return') {
					token = span(token, 'control');
				} else if (token == 'my') {
				} else if (token == 'if' || token == 'elsif' || token == 'else' || token == 'for') {
					token = span(token, 'control');
				} else if (token == 'defined' || token == 'exists' || token == 'shift' || token == 'pop' || token == 'push' || token == 'unshift' || token == 'eq' || token == 'ne' || token == 'lt' || token == 'gt' || token == 'cmp') {
					token = span(token, 'op');
				} else if (tokenN.match(/^\(/) || tokenP.match(/->/)) {
					token = span(token, 'op');
				} else {
					token = spanOrA(token, 'im');
				}
			} else if (token == 'CN') {
				token = span(token, 'type');
			} else if (token.match(/^[A-Z0-9_]+$/)) {
				if (tokenPP == 'package' && tokenP == ' ') {
					token = span(token, 'definition');
				} else {
					token = span(token, 'ctext');
				}
			} else if (token.match(/^[A-Z][a-z0-9_]+$/)) {
				if (tokenPP == 'package' && tokenP == ' ') {
					token = span(token, 'definition');
				}
			} else if (token.match(/^'/)) {
				token = span(token, 'ctext');
			} else if (token == '//') {
			} else if (token.match(/^\//)) {
				token = span(token, 'ctext');
			} else if (token.match(/^#/)) {
				var match = token.match(/^(.*?)(\n*)$/);
				token = span(match[1], 'comment') + match[2];
			} else if (token.match(/^CN::[A-Z]/)) {
				token = genericSpanOrA(token.substr(4), 'type', 'CN::', platforms.perl);
			} else if (token.match(/^\(\)/)) {
				token = '<span style="opacity:0.2">()</span>' + token.substr(2);
			}

			var semicolon = token.match(/^(.*);(\s*)$/);
			if (semicolon)
				token = semicolon[1] + '<span style="opacity:0.2">;</span>' + semicolon[2];
			else if (token == '->') token = '-&gt;';

			text += token;
		}

		element.innerHTML = prepareFinal(text);

		function spanOrA(token, className) {
			return genericSpanOrA(token, className, '', platforms.perl);
		}
	}

	function javascriptHighlight(element) {
		var text = '';
		var tokens = prepareInput(element.innerHTML).split(/(\/.*?[^\\]\/|\s+|[\.,;&<>\|\[\]\(\)\+\*-]+|'.*?'|\/\/.*?\n|\/=?)/);
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var tokenN = tokens[i + 1] || '';
			var tokenP = tokens[i - 1] || '';
			var tokenPP = tokens[i - 2] || '';

			if (token == 'if' || token == 'return' || token == 'for' || token == 'while') {
				token = span(token, 'control');
			} else if (token.match(/^[a-z]/)) {
				if (token == 'var') {
				} else if (token == 'function') {
				} else if (tokenN.match(/^\(/)) {
					token = span(token, 'op');
				} else if (token == 'new') {
					token = span(token, 'op');
				} else if (token.match(/_$/)) {
					token = spanOrA(token.substr(0, token.length - 1), 'm');
				} else {
					var annotation = parseAnnotation();
					token = spanOrA(token, 'im', annotation);
				}
			} else if (token.match(/^[A-Z0-9]+$/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^'/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^[A-Z]/)) {
				token = spanOrA(token, 'type');
			} else if (token.match(/^\/\//)) {
				var match = token.match(/^(.*?)(\n*)$/);
				token = span(match[1], 'comment') + match[2];
			} else if (token.match(/^\[\]/)) {
				token = span('[]', 'type') + token.substr(2);
			}

			var semicolon = token.match(/^(.*);(\s*)$/);
			if (semicolon)
				token = semicolon[1] + '<span style="opacity:0.2">;</span>' + semicolon[2];
			else if (token == '>') token = '&gt;';
			else if (token == '<') token = '&lt;';

			text += token;
		}

		element.innerHTML = prepareFinal(text);

		function spanOrA(token, className, annotation) {
			return annotation == null ? genericSpanOrA(token, className, '', platforms.javascript) : genericSpanOrAWithTypeAnnotation(token, className, '', platforms.javascript, annotation);
		}

		function parseAnnotation() {
			if (tokens[i + 1] != ' ' || (tokens[i + 2] != '!!' && tokens[i + 2] != '??')) return;
			var optional = tokens[i + 2] == '??' ? ' | null' : '';
			i += 2;

			var annotation = '';
			while (i < tokens.length) {
				var token = tokens[i + 1];
				if (! token.match(/^[ A-Za-z0-9\.]*$/)) break;
				annotation += token;
				i += 1;
			}

			return annotation.trim() + optional;
		}
	}

	function swiftHighlight(element) {
		var text = '';
		var tokens = prepareInput(element.innerHTML).split(/(\/.*?[^\\]\/|\s+|[\.,;&<>\|\[\]\(\)\+\*-]+|'.*?'|\/\/.*?\n|\/=?)/);
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var tokenN = tokens[i + 1] || '';
			var tokenP = tokens[i - 1] || '';
			var tokenPP = tokens[i - 2] || '';

			if (token == 'if' || token == 'return' || token == 'for' || token == 'while') {
				token = span(token, 'control');
			} else if (token.match(/^[a-z]/)) {
				if (token == 'var') {
				} else if (token == 'function') {
				} else if (tokenN.match(/^\(/)) {
					token = span(token, 'op');
				} else if (token == 'new') {
					token = span(token, 'op');
				} else if (token.match(/_$/)) {
					token = spanOrA(token.substr(0, token.length - 1), 'm');
				} else {
					var annotation = parseAnnotation();
					token = spanOrA(token, 'im', annotation);
				}
			} else if (token.match(/^[A-Z0-9]+$/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^'/)) {
				token = span(token, 'ctext');
			} else if (token.match(/^[A-Z]/)) {
				token = spanOrA(token, 'type');
			} else if (token.match(/^\/\//)) {
				var match = token.match(/^(.*?)(\n*)$/);
				token = span(match[1], 'comment') + match[2];
			} else if (token.match(/^\[\]/)) {
				token = span('[]', 'type') + token.substr(2);
			}

			var semicolon = token.match(/^(.*);(\s*)$/);
			if (semicolon)
				token = semicolon[1] + '<span style="opacity:0.2">;</span>' + semicolon[2];
			else if (token == '>') token = '&gt;';
			else if (token == '<') token = '&lt;';

			text += token;
		}

		element.innerHTML = prepareFinal(text);

		function spanOrA(token, className, annotation) {
			return annotation == null ? genericSpanOrA(token, className, '', platforms.swift) : genericSpanOrAWithTypeAnnotation(token, className, '', platforms.swift, annotation);
		}

		function parseAnnotation() {
			if (tokens[i + 1] != ' ' || (tokens[i + 2] != '!!' && tokens[i + 2] != '??')) return;
			var optional = tokens[i + 2] == '??' ? ' | null' : '';
			i += 2;

			var annotation = '';
			while (i < tokens.length) {
				var token = tokens[i + 1];
				if (! token.match(/^[ A-Za-z0-9\.]*$/)) break;
				annotation += token;
				i += 1;
			}

			return annotation.trim() + optional;
		}
	}

	function prepareInput(text) {
		return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>') + '\n';
	}

	function prepareFinal(text) {
		var lines = text.split(/\n/);

		var minIndent = 100;
		var firstNonEmpty = -1;
		var lastNonEmpty = -1;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			// Empty lines before and after
			if (line.match(/^\s*$/)) continue;
			if (firstNonEmpty == -1) firstNonEmpty = i;
			lastNonEmpty = i;

			// Max indent of non-empty lines
			var indent = line.match(/^\t*/);
			minIndent = Math.min(minIndent, indent[0].length);
		}

		// Cut
		var final = '';
		for (var i = firstNonEmpty; i < lastNonEmpty; i++)
			final += replaceTabs(lines[i].substr(minIndent)) + '\n';
		if (lastNonEmpty >= 0)
			final += replaceTabs(lines[lastNonEmpty].substr(minIndent));

		return final;
	}

	function replaceTabs(text) {
		var match = text.match(/^\t*/);
		var indent = match[0].length;
		var spaces = '';
		for (var i = 0; i < indent; i++) spaces += '    ';
		return spaces + text.substr(indent);
	}

	function span(symbol, className) {
		return '<span class="' + className + '">' + symbol + '</span>';
	}

	function genericSpanOrA(symbol, className, symbolPrefix, platform) {
		var info = guess(symbol);
		if (! info) return '<span class="' + className + '">' + symbolPrefix + symbol + '</span>';
		var title = info[platform.id] || (platform.typePrefix + info.type);
		if (! info.href) return '<span class="' + className + '" title="' + title + '">' + symbolPrefix + symbol + '</span>';
		return '<a class="' + className + '" title="' + title + '" href="' + info.href + '">' + symbolPrefix + symbol + '</a>';
	}

	function genericSpanOrAWithTypeAnnotation(symbol, className, symbolPrefix, platform, type) {
		var info = guess(type);
		if (! info) return '<span class="' + className + '" title="' + type + '">' + symbolPrefix + symbol + '</span>';
		if (! info.href) return '<span class="' + className + '" title="' + type + '">' + symbolPrefix + symbol + '</span>';
		return '<a class="' + className + '" title="' + type + '" href="' + info.href + '">' + symbolPrefix + symbol + '</a>';
	}

	function guess(symbol) {
		if (symbol == 'rsaPublicKey') return {type: 'RSAPublicKey', perl: 'struct cnRSAPublicKey (C code)'};
		if (symbol == 'rsaPrivateKey') return {type: 'RSAPrivateKey', perl: 'struct cnRSAPrivateKey (C code)'};
		if (symbol == 'ImmutableStack') return {type: 'ImmutableStack&lt;T&gt;'};
		if (symbol.match(/(^k|K)eyPair$/)) return {type: 'KeyPair', href: '/api/key-pair/'};
		if (symbol.match(/(^a|A)ctorWithDataTree$/)) return {type: 'ActorWithDataTree', href: '/api/actor-with-data-tree/'};
		if (symbol.match(/(^p|P)ublicKeys?$/)) return {type: 'PublicKey', href: '/api/public-key/'};
		if (symbol.match(/(^p|P)ublicKeyCaches?$/)) return {type: 'PublicKeyCache', href: '/api/public-key-cache/'};
		if (symbol.match(/(^r|R)ecords?$/)) return {type: 'Record', href: '/api/record/'};
		if (symbol == 'envelope') return {type: 'Record', href: '/specifications/envelope/'};
		if (symbol.match(/HTTPServer::/)) return null;
		if (symbol.match(/(^o|O)bjects?$/)) return {type: 'Object', href: '/api/object/'};
		if (symbol.match(/(^h|H)ash(es)?$/)) return {type: 'Hash', href: '/api/hash/'};
		if (symbol.match(/(^a|A)ccounts?$/)) return {type: 'Account', href: '/api/account/'};
		if (symbol.match(/(^f|F)olderStores?$/)) return {type: 'FolderStore', href: '/api/store/folder/'};
		if (symbol.match(/(^s|S)erver?$/)) return {type: 'HTTPServer', href: '/api/http-server/'};
		if (symbol.match(/(^s|S)tores?$/)) return {type: 'Store', href: '/api/store/'};
		if (symbol.match(/(^a|A)ccountWithKeys?$/)) return {type: 'AccountWithKey', href: '/api/account-with-key/'};
		if (symbol.match(/(^r|R)eferences?$/)) return {type: 'Reference', href: '/api/reference/'};
		if (symbol.match(/(^b|B)ytes$/)) return {type: 'Bytes', href: '/api/bytes/', perl: 'byte string', javascript: 'Utf8Array'};
		return null;
	}
}

function syntaxHighlight(element) {
	function highlightToggle() {
		if (this.style.fontWeight == 'bold') highlightOff(); else highlightOn();
	}

	function highlightOn() {
		for (var i = 0; i < elements.length; i++) {
			//elements[i].style.color = this.syntaxGroup == elements[i].syntaxGroup ? 'black' : null;
			elements[i].style.backgroundColor = this.syntaxGroup == elements[i].syntaxGroup ? '#cccc33' : 'transparent';
		}
	}

	function highlightOff() {
		for (var i = 0; i < elements.length; i++) {
			//elements[i].style.color = null;
			elements[i].style.backgroundColor = 'transparent';
		}
	}

	function traverse(element) {
		var e = element.firstChild;
		while (e != null) {
			if (e.tagName == 'SPAN') {
				add(e, e.innerHTML);
			} else {
				traverse(e);
			}
			e = e.nextSibling;
		}
	}

	function add(element, group) {
		element.onclick = highlightToggle;
		element.onmouseenter = highlightOn;
		element.onmouseleave = highlightOff;
		element.syntaxGroup = group;
		elements.push(element);
	}

	function addById(id, group) {
		add(document.getElementById(id), group);
	}

	var elements = [];
	traverse(element);
	//addById('hashpair', 'HASHPAIR');
}
