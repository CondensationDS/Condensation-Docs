'use strict';

var structureExplorer = createStructureExplorer();

function createStructureExplorer() {
	var types = {};

	function addType(name, url, fields, description) {
		return types[name] = {name: name, url: url, fields: fields, description: description};
	}

	function addPlatformType(name, description) {
		return types[name] = {name: name, description: description, platformDependent: true};
	}

	function finalizeTypes() {
		for (var name in types) {
			var type = types[name];
			if (! type.implementedTypes) continue;

			for (var i = 0; i < type.implementedTypes.length; i++) {
				var iName = type.implementedTypes[i];
				var iType = types[iName];
				if (! iType) continue;
				if (! iType.subTypes) iType.subTypes = [];
				iType.subTypes.push(type);
			}
		}

		for (var name in types) {
			var type = types[name];
			if (! type.subTypes) continue;
			type.subTypes.sort(function(a, b) { return a.name.localeCompare(b.name); });
		}
	}

	addType('Actor with Data Tree', '/api/key-pair/', [
		{name: 'key pair', type: 'Key Pair'},
		{name: 'storage store', type: 'Store'},
		{name: 'messaging store', type: 'Store'},
		{name: 'root', type: 'Selector', section: 'Private data'},
		{name: 'public data selector', type: 'Selector'},
		{name: 'actor group selector', type: 'Selector'},
		{name: 'actor selector', type: 'Selector'},
		{name: 'entrusted keys selector', type: 'Selector'}
		]);

	addType('Selector', '/api/selector/', [
		{name: 'label', type: 'Bytes'},
		{name: 'parent', type: 'Selector'}
		]);

	addType('Key Pair', '/api/key-pair/', [
		{name: 'public key', type: 'Public Key'},
		{name: 'RSA private key', type: 'RSA Private Key'}
		]);

	addType('Public Key', '/api/public-key/', [
		{name: 'hash', type: 'Hash'},
		{name: 'object', type: 'Object'},
		{name: 'RSA public key', type: 'RSA Public Key'}
		]);

	addType('RSA Public Key', null, [
		{name: 'e', type: 'Big Integer', comment: 'Public exponent'},
		{name: 'n', type: 'Big Integer', comment: 'Modulus'}
		]);

	addType('RSA Private Key', null, [
		{name: 'e', type: 'Big Integer', comment: 'Public exponent'},
		{name: 'p', type: 'Big Integer', comment: 'First prime number'},
		{name: 'q', type: 'Big Integer', comment: 'Second prime number'}
		]);

	addType('Account with Key', '/api/account-with-key/', [
		{name: 'store', type: 'Store'},
		{name: 'public key', type: 'Public Key'}
		]);

	addType('Store', '/api/store/', [
		{name: 'ID', type: 'Text'}
		]);

	addType('In-Memory Store', '/api/store/in-memory/', [
		{name: 'ID', type: 'Text'},
		{name: 'objects', type: 'Map', mutable: true},
		{name: 'accounts', type: 'Map', mutable: true}
		]).implementedTypes = ['Store'];

	addType('Hash Verification Store', '/api/store/hash-verification/', [
		{name: 'ID', type: 'Text'},
		{name: 'store', type: 'Store'}
		]).implementedTypes = ['Store'];

	addType('Folder Store', '/api/store/folder/', [
		{name: 'ID', type: 'Text'},
		{name: 'folder', type: 'Text'}
		]).implementedTypes = ['Store'];

	addType('HTTP Store', '/api/store/http/', [
		{name: 'ID', type: 'Text'},
		{name: 'URL', type: 'Text'}
		]).implementedTypes = ['Store'];

	addType('FTP Store', '/api/store/ftp/', [
		{name: 'ID', type: 'Text'},
		{name: 'end point', type: 'Text'},
		{name: 'folder', type: 'Text'}
		]).implementedTypes = ['Store'];

	addType('SFTP Store', '/api/store/sftp/', [
		{name: 'ID', type: 'Text'},
		{name: 'end point', type: 'Text'},
		{name: 'folder', type: 'Text'}
		]).implementedTypes = ['Store'];

	addType('Object Cache', '/api/store/object-cache/', [
		{name: 'ID', type: 'Text'},
		{name: 'backend store', type: 'Store'},
		{name: 'cache store', type: 'Store'}
		]).implementedTypes = ['Store'];

	addType('Split Store', '/api/store/split/', [
		{name: 'ID', type: 'Text'},
		{name: 'key', type: 'Bytes', comment: '32 bytes', section: 'Store mapping'},
		{name: 'object stores', type: 'List of Stores', comment: '256 stores'},
		{name: 'account stores', type: 'List of Stores', comment: '256 stores'}
		]).implementedTypes = ['Store'];

	addType('Log Store', '/api/store/log/', [
		{name: 'ID', type: 'Text'},
		{name: 'store', type: 'Store'},
		{name: 'file handle', type: 'File Handle'},
		{name: 'prefix', type: 'Text'}
		]).implementedTypes = ['Store'];

	addType('Get from Any Store', '/api/store/get-from-any/', [
		{name: 'ID', type: 'Text'},
		{name: 'stores', type: 'List of Stores'},
		]).implementedTypes = ['Store'];

	addType('List of Stores', null, [
		{name: 'store 0', type: 'Store'},
		{name: 'store 1', type: 'Store'},
		{name: '...', type: ''}
		]);

	addType('Hash', '/api/hash/', [
		{name: 'bytes', type: 'Bytes', comment: '32 bytes'}
		]);

	addType('Reference', '/api/reference/', [
		{name: 'hash', type: 'Hash'},
		{name: 'key', type: 'Bytes', comment: 'AES 256 key, 32 bytes'}
		]);

	addType('Object', '/api/object/', [
		{name: 'hashes count', type: 'Integer'},
		{name: 'header', type: 'Bytes'},
		{name: 'data', type: 'Bytes'}
		]);

	addType('Record', '/api/record/', [
		{name: 'bytes', type: 'Bytes', mutable: true},
		{name: 'hash', type: 'Hash', optional: true, mutable: true},
		{name: 'children', type: 'List of Records', mutable: true}
		]);

	addType('List of Records', null, [
		{name: 'child 0', type: 'Record', mutable: true},
		{name: 'child 1', type: 'Record', mutable: true},
		{name: '...', type: '', mutable: true}
		]);

	addType('Source', '/api/source/', [
		{name: 'account with key', type: 'Account with Key'},
		{name: 'box label', type: 'Box Label'},
		{name: 'hash', type: 'Hash'}
		]);

	addType('Box Label').instances = ['in-queue', 'private', 'public'];

	addPlatformType('Big Integer', 'Integer of arbitrary length');
	addPlatformType('Text', 'Unicode-capable string');
	addPlatformType('Bytes', 'Byte string').url = '/api/bytes/';
	addPlatformType('Boolean');
	addPlatformType('Integer', 'Signed 32-bit integer');
	addPlatformType('List', 'Mutable list');

	addPlatformType('Memory Buffer');
	addPlatformType('File Handle');
	addPlatformType('Map', 'Mutable dictionary');

	//addFunction('child [label|Bytes] of [selector|Selector]', 'Selector', '/api/selector/');
	//addFunction('child [label|Text] of [selector|Selector]', 'Selector', '/api/selector/');

	finalizeTypes();

	var structure = document.getElementById('structure');

	var ns = 'http://www.w3.org/2000/svg';
	var svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	svg.setAttribute('width', '600');
	svg.setAttribute('height', '400');
	structure.appendChild(svg);

	var columns = [];
	layout();

	function getColumn(id) {
		var column = columns[id];
		if (column) return column;
		return columns[id] = [];
	}

	function layout() {
		var x = 0;
		var maxHeight = 0;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			if (! column.length) continue;

			// Determine the ideal positions
			for (var n = 0; n < column.length; n++) {
				var group = column[n];
				group.currentIdealY = group.idealY();
				group.x = x;
				group.y = group.currentIdealY;
				group.height = group.firstElementChild.getAttribute('height') * 1;
			}

			// Sort
			column.sort(function(a, b) { return a.currentIdealY - b.currentIdealY; });

			// Optimize
			for (var r = 0; r < 1000; r++) {
				for (var n = 0; n < column.length; n++)
					column[n].fy = 0;

				for (var n = 1; n < column.length; n++) {
					var group = column[n];
					var groupP = column[n - 1];
					if (group.y < groupP.y + groupP.height + 10) {
						groupP.fy -= 1;
						group.fy += 1;
					}
				}

				var maxF = 0;
				for (var n = 0; n < column.length; n++) {
					var group = column[n];
					group.y += group.fy;
					maxF = Math.max(maxF, group.fy);
				}

				if (maxF == 0) break;
			}

			// Set the assigned positions
			var y = 0;
			var maxWidth = 0;
			for (var n = 0; n < column.length; n++) {
				var group = column[n];
				group.y = Math.max(y, group.y);
				group.setAttribute('transform', 'translate(' + Math.round(group.x) + ',' + Math.round(group.y) + ')');
				group.updateFromLine();
				y = group.y + group.height + 10;
				maxWidth = Math.max(maxWidth, group.firstElementChild.getAttribute('width') * 1);
			}

			var lastGroup = column[column.length - 1];
			maxHeight = Math.max(maxHeight, lastGroup.y + lastGroup.height);
			x += maxWidth + 20;
		}

		svg.setAttribute('width', x - 20);
		svg.setAttribute('height', maxHeight);
		structure.style.maxWidth = x - 20 <= 600 ? '600px' : 'none';
	}

	function showType(type, columnId, fromField) {
		if (! type) return;

		var y = 10;
		var width = 180;

		var group = document.createElementNS(ns, 'g');
		svg.appendChild(group);

		var column = getColumn(columnId);
		column.push(group);

		var box = document.createElementNS(ns, 'rect');
		box.setAttribute('x', 0);
		box.setAttribute('y', 0);
		box.setAttribute('rx', 6);
		box.style.fill = type.platformDependent ? 'none' : 'black';
		box.style.stroke = type.platformDependent ? 'black' : 'none';
		box.style.strokeWidth = 2;
		box.style.opacity = 0.1;
		group.appendChild(box);

		var title = document.createElementNS(ns, 'text');
		title.setAttribute('x', 10);
		title.setAttribute('y', y + 16);
		title.textContent = type.name;
		title.style.fill = 'black';
		title.style.fontSize = '18px';
		title.style.fontWeight = 600;
		group.appendChild(title);
		y += 20;
		width = Math.max(width, title.getComputedTextLength() + 20);

		if (type.url) {
			title.style.cursor = 'pointer';
			title.onclick = function() { location.href = type.url; };
		}

		if (type.description) {
			var description = document.createElementNS(ns, 'text');
			description.setAttribute('x', 10);
			description.setAttribute('y', y + 16);
			description.textContent = type.description;
			description.style.fill = 'black';
			description.style.fontSize = '13px';
			group.appendChild(description);
			y += 20;
			width = Math.max(width, description.getComputedTextLength() + 20);
		}

		var fields = [];
		if (type.fields) {
			y += 10;
			for (var i = 0; i < type.fields.length; i++)
				fields.push(addField(type.fields[i]));
		}

		function addField(field) {
			if (field.section != null) addSectionTitle(field.section);

			var box = document.createElementNS(ns, 'rect');
			box.field = field;
			box.top = y;
			box.setAttribute('x', 10);
			box.setAttribute('y', box.top + 2);
			box.setAttribute('rx', 4);
			box.setAttribute('width', 16);
			box.setAttribute('height', 16);
			box.style.fill = field.mutable ? '#3f8de5' : '#6bc55f';
			box.style.cursor = 'pointer';
			box.onclick = toggle;
			group.appendChild(box);

			var title = document.createElementNS(ns, 'title');
			title.textContent = field.type + (field.optional ? ' | Null' : '');
			box.appendChild(title);

			var typeIndicator = document.createElementNS(ns, 'text');
			typeIndicator.setAttribute('x', 18);
			typeIndicator.setAttribute('y', box.top + 14);
			typeIndicator.textContent = field.type.substr(0, 1);
			typeIndicator.style.fill = 'white';
			typeIndicator.style.fontSize = '12px';
			typeIndicator.style.fontWeight = 'bold';
			typeIndicator.style.textAnchor = 'middle';
			typeIndicator.style.cursor = 'pointer';
			typeIndicator.onclick = toggle;
			group.appendChild(typeIndicator);

			var name = document.createElementNS(ns, 'text');
			name.setAttribute('x', 32);
			name.setAttribute('y', box.top + 16);
			name.textContent = field.name + (field.optional ? ' ?' : '');
			name.style.fill = 'black';
			name.style.fontSize = '18px';
			name.style.cursor = 'pointer';
			name.onclick = toggle;
			group.appendChild(name);
			y += 20;
			width = Math.max(width, name.getComputedTextLength() + 42);

			if (field.comment != null) {
				var comment = document.createElementNS(ns, 'text');
				comment.setAttribute('x', 32);
				comment.setAttribute('y', y + 12);
				comment.textContent = field.comment;
				comment.style.fill = 'black';
				comment.style.fontSize = '13px';
				group.appendChild(comment);
				y += 20;
				width = Math.max(width, comment.getComputedTextLength() + 42);
			}

			box.getX = function() { return group.x + 32 + name.getComputedTextLength() + 10; };
			box.getY = function() { return group.y + box.top + 10; };
			box.showType = open;
			box.hideType = close;

			var openType = null;

			function toggle() {
				if (openType) close();
				else open();
			}

			function open() {
				if (openType) return;
				openType = showType(types[field.type], columnId + 1, box);
				layout();
				return openType;
			}

			function close() {
				if (! openType) return;
				openType.remove();
				openType = null;
				layout();
				return null;
			}

			return box;
		}

		if (fromField) addFromLine();
		else noFromLine();

		function addFromLine() {
			var path = document.createElementNS(ns, 'path');
			path.style.fill = 'none';
			path.style.stroke = 'black';
			path.style.strokeWidth = '1';
			group.appendChild(path);

			group.updateFromLine = function() {
				var fromX = fromField.getX();
				var fromY = fromField.getY();
				path.setAttribute('d', 'm -2.5,20.5 h -7 v ' + (fromY - group.y - 20) + ' h ' + (fromX - group.x + 9.5));
			};

			group.idealY = function() { return fromField.getY() - 20; };
		}

		function noFromLine() {
			group.updateFromLine = function() {};
			group.idealY = function() { return 0 };
		}

		if (type.subTypes) {
			addSectionTitle('Implementations');
			for (var i = 0; i < type.subTypes.length; i++)
				addSubType(type.subTypes[i]);
		}

		function addSubType(subType) {
			var name = document.createElementNS(ns, 'text');
			name.setAttribute('x', 10);
			name.setAttribute('y', y + 12);
			name.textContent = subType.name;
			name.style.fill = 'black';
			name.style.fontSize = '13px';
			group.appendChild(name);
			y += 15;
			width = Math.max(width, name.getComputedTextLength() + 20);

			if (subType.url) {
				name.style.cursor = 'pointer';
				name.onclick = function() { location.href = subType.url; };
			}
		}

		if (type.instances) {
			addSectionTitle('Instances (enum)');
			for (var i = 0; i < type.instances.length; i++)
				addInstance(type.instances[i]);
		}

		function addInstance(instance) {
			var name = document.createElementNS(ns, 'text');
			name.setAttribute('x', 10);
			name.setAttribute('y', y + 12);
			name.textContent = instance;
			name.style.fill = 'black';
			name.style.fontSize = '13px';
			group.appendChild(name);
			y += 15;
			width = Math.max(width, name.getComputedTextLength() + 20);
		}

		function addSectionTitle(sectionTitle) {
			y += 10;
			if (sectionTitle != '') {
				var section = document.createElementNS(ns, 'text');
				section.setAttribute('x', 10);
				section.setAttribute('y', y + 12);
				section.textContent = sectionTitle;
				section.style.fill = 'black';
				section.style.fontSize = '13px';
				section.style.fontWeight = 600;
				group.appendChild(section);
				y += 20;
				width = Math.max(width, section.getComputedTextLength() + 20);
			}
		}

		group.remove = function() {
			for (var i = 0; i < fields.length; i++)
				fields[i].hideType();

			svg.removeChild(group);
			var index = column.indexOf(group);
			if (index >= 0) column.splice(index, 1);
		};

		group.openField = function(fieldName) {
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				if (field.field.name == fieldName) return field.showType();
			}

			return null;
		};

		box.setAttribute('width', width);
		box.setAttribute('height', y + 10);
		return group;
	}

	var structureExplorer = {};

	structureExplorer.show = function(typeName) {
		var type = showType(types[typeName], 0, null);
		layout();
		return type;
	};

	return structureExplorer;
}
