Document.prototype.querySelectorAttribute = function(selector, attribute, value) {
	let els = document.querySelectorAll(selector);

	for (let i = 0; i < els.length; i++) {
		const element = els[i];
		if(element.hasAttribute(attribute) && element.getAttribute(attribute) == value) {
			return element;
		}
	}
	return undefined;
}
Element.prototype.setStyle = function(object, value = '') {
	if(typeof(object) == 'object') {
		for(let key in object) {
			if(key in this.style) { this.style[key] = object[key]; }
		}
	} else {
		if(object in this.style) { this.style[object] = value; }
	}
}
Element.prototype.appendHTML = function(str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) {
    this.appendChild(div.children[0]);
  }
}

let custoMenu = {
	functions: {},
	element: '',
	
	addMenu : function(array) {
		// append menu
		document.body.appendHTML('<ul class="custoMenu" style="display: none;" data-name="' + array['name'] + '"></ul>');
		menu = document.body.lastElementChild;
		
		// for each item in array
		for(let key in array['items']) {
			// get desc 
			let desc = array['items'][key]['desc'] || key.charAt(0).toUpperCase() + key.substr(1);
			
			// append item
			menu.appendHTML('<li data-action="' + key + '" title="' + desc + '">' + array['items'][key]['text'] + '</li>');
			
			// if defined, save function
			let func = array['items'][key]['func'];
			if(func !== undefined) {
				if(typeof func === "function") {
					this.functions[key] = func;
				}
			}
		}
	},
	openMenu : function(element, e) {
		// close all custoMenus
		this.closeMenu();
		
		// update last element
		this.upElement(element);
		
		// get name
		let name = this.getData('data-name');
		// get custoMenu
		let ctxmenu = document.querySelectorAttribute('ul.custoMenu', 'data-name', name);
		
		//display custoMenu
		ctxmenu.setStyle({
			display: "block",
			top: e.pageY + "px",
			left: e.pageX + "px"
		});

		// adjust position
		if(e.pageY + ctxmenu.offsetHeight > window.innerHeight) {
			ctxmenu.setStyle('top', e.pageY - ctxmenu.offsetHeight + 'px');
		}
	},
	closeMenu: function() {
		// hide menu
		let menus = document.getElementsByClassName('custoMenu');
		for (let i = 0; i < menus.length; i++) {
			menus[i].setStyle('display', 'none');
		}
	},
	openFunction: function(element) {
		// get name of function
		let action = element.getAttribute('data-action');
		// if this function is defined
		if(typeof this.functions[action] === "function") {
			// execute it
			this.functions[action]();
		}
	},
	upElement: function(element) {
		//update last last clicked element
		this.element = element;
	},
	getData: function(attribute) {
		// get last clicked element attribute
		return this.element.getAttribute(attribute);
	}
}
document.addEventListener('DOMContentLoaded', function(){
	document.body.addEventListener('contextmenu', function(evt){
		let el = evt.target;
		while(el != null && el != document.body && !el.classList.contains('custoMe')) {
			el = el.parentElement;
		}

		if(el != null && el.classList.contains('custoMe')) {
			evt.preventDefault();
			evt.stopPropagation();
			custoMenu.openMenu(el, evt);
		}
	});

	document.body.addEventListener('click', function(evt){
		let el = evt.target;
		while(el != null && el != document.body && el.parentElement != null && !el.parentElement.classList.contains('custoMenu') && el.tagName != "LI") {
			el = el.parentElement;
		}

		custoMenu.closeMenu();
		if(el != null && el.parentElement.classList.contains('custoMenu') && el.tagName == "LI") {
			custoMenu.openFunction(el);
		}
	});
}, false);
