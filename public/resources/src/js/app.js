/**
 * forcept - app.js
 * @author Cameron Kelley
 */

/// Bind all a elements to change the URL
/// and run the render method.
window.onclick = function(event) {
	var run = function(elem) {
		if(!elem.classList.contains("js-override")) {
			event.preventDefault();
			if(Socket.vitalOperationsInProgress.length == 0) {
				console.log("[core.js] Link clicked: " + elem.href);
				window.history.pushState({}, "",  elem.href);
				Core.render();
			} else console.log("[core.js] tried to click to " + elem.href + " but " + Socket.vitalOperationsInProgress.length + " vital in progress");
		} else {
			if(elem.classList.contains("js-distress-beacon")) {
				var prefilledName = Core.User.isAuthenticated() ? Core.User.username : "";
				var name = prompt("Please enter your name so someone can come and help :)", prefilledName);

				if(name != null) {
					var context = (elem.hasAttribute('data-context') ? elem.getAttribute('data-context') : "unknown") + " [" + window.location.pathname + "]";
					Socket.send("distressBeacon", { name: name, context: context });
					alert("Help request sent.");
				} else alert("You didn't enter a name!");
			}
		}
	};

	if(event.target.localName == 'a') {
		run(event.target);
	} else if(event.target.parentElement.localName == 'a') {
		run(event.target.parentElement);
	}
}

/// When the window state changes,
/// re-render the page
window.onpopstate = function(event) {
	Core.render();
};

/// Set onOpen function so we can render the
/// page once the socket is ready to go.
Socket.onOpen = function() 
{

	console.log("[app.js] Socket opened, running onOpen callback");

	Core.connectionAttempts = 0;
	Core.hasRendered = true;


	/// Check if we're authenticated.
	if(Core.User.isAuthenticated()) {

		var sidebar = document.getElementById("sidebar-contain");
		if(sidebar.classList.contains("hidden")) {
			sidebar.classList.remove("hidden");
		}

		/// setup the user class so we can access
		Core.User.setup();

		/// Render current page
		Core.render();
	} else {
		/// Rotate to login panel with return to URI
		Core.switchPage("/login");
	}
}

/// We want the socket to be open 24/7, so if
/// it's closed, we need to re-establish connection.
Socket.onClose = function()
{
	Core.connectionAttempts++;
	if(Core.connectionAttempts >= 4) {
		if(Core.hasRendered == false) {
			Core.handleError("disconnected-prerender");
		} else {
			Core.handleError("disconnected-postrender");
		}
	} else {
		Core.reconnectTimeout = setTimeout(function() {
			Socket.init(Core.socketAddress);
		}, Core.reconnectTimeoutWaitTime);
	}
}

/// Blast off!
Socket.init(Core.socketAddress);
