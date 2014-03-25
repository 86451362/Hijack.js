// DOMParser text/html shim
// https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#Browser_compatibility
(function(DOMParser) {

	var nativeParseFromString = DOMParser.prototype.parseFromString;

	try {
		if (new DOMParser().parseFromString('', 'text/html') !== null) {
            return;
		}
	} catch (ex) {}

	DOMParser.prototype.parseFromString = function(markup, type) {
		if (type === 'text/html') {
            var doc = document.implementation.createHTMLDocument('');
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
            return doc;
        }
        return nativeParseFromString.apply(this, arguments);
	};
}(DOMParser));

(function (root) {

    var Hijack = function (url, callback) {        
        this.xhr = new XMLHttpRequest();
        this.xhr.open('GET', url);
        this.xhr.onreadystatechange = function () {
            if (this.xhr.readyState != 4 || this.xhr.status != 200) return;
            this.onload();
            if(callback) callback();
        }.bind(this);
        
        return this;
    };
    
    Hijack.prototype.fetch = function () {
        this.xhr.send();
    };

    Hijack.prototype.onload = function () {
        this.hijack(new DOMParser().parseFromString(this.xhr.responseText, 'text/html'));
    };
    
    Hijack.prototype.policies = {
        'SCRIPT': [
            function (node) {
                var script = document.createElement('script');
                script.src = node.src;
                script.type = node.type;
                // In Firefox 4.0, the async DOM property defaults to true for script-created scripts, so the default behavior matches the behavior of IE and WebKit.
                // https://developer.mozilla.org/en/docs/Web/HTML/Element/script#Async_support
                script.async = false;
                return script;
            }
        ]
    };

    Hijack.prototype.hijack = function (doc) {
        this.append('head', doc);
        this.append('body', doc);
    }

    Hijack.prototype.append = function (tag, doc) {
        var childNodes = doc.getElementsByTagName(tag)[0].childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            document.getElementsByTagName(tag)[0].appendChild(
                this.applyPolicies(document.importNode(childNodes[i], true))
            );
        }
    };

    Hijack.prototype.addPolicy = function (tagName, policy) {
        if(!this.policies[tagName]) {
            this.policies[tagName] = [];
        }

        this.policies[tagName].push(policy);
    };

    Hijack.prototype.applyPolicies = function (node) {
    
        if(this.policies[node.tagName]) {
            for(var i = 0; i < this.policies[node.tagName].length; i++) {
                node = this.policies[node.tagName][i](node);
            }
        }
        
        if(this.policies['']) {
            for(var i = 0; i < this.policies[''].length; i++) {
                node = this.policies[''][i](node);
            }
        }

        return node;
    };

    root.hijack = function (url, callback) {
        new Hijack(url, callback).fetch();
    };

    root.Hijack = Hijack;

}(this));
