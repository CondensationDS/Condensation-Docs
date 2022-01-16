function syntaxLinks(group) {
	var byLabel = {};
	for (var i = 0; i < group.length; i++)
		process(group[i]);

	function process(element) {
		if (element.tagName == 'SPAN' || element.tagName == 'A') return add(element);

		for (var child = element.firstElementChild; child; child = child.nextElementSibling)
			process(child);
	}

	function add(element) {
		var isImmutable = element.classList.contains('im');
		var isMutable = element.classList.contains('m');
		if (! isImmutable && ! isMutable) return;

		var label = element.textContent;
		var uses = byLabel[label];
		if (uses == null) byLabel[label] = uses = [];
		uses.push(element);

		element.classList.add('hoverable');

		element.onmouseenter = function(event) {
			for (var i = 0; i < uses.length; i++)
				uses[i].classList.add('hovering');
		};

		element.onmouseleave = function(event) {
			for (var i = 0; i < uses.length; i++)
				uses[i].classList.remove('hovering');
		};
	}
}

function syntaxLinksAll() {
	syntaxLinks(document.getElementsByTagName('PRE'));
}
