/**
 * Forcept
 * react components: base.js
 */


var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


/* ================================================== */


/**
 * SIGN IN
 */
var LogInContainer = React.createClass({
	getInitialState: function() {
		return {
			submitting: false,
			isValid: false
		};
	},
	handleSubmit: function(model) {
		console.log("[components.js] handling submit for LogInContainer");
		this.setState({submitting:true});
		model["pin"] = Sha1.hash(model["pin"]);

		Socket.handle("doLogin", function(args) {
			if(!args.hasOwnProperty("error")) {
				/// we good in the hood
				Core.Util.setCookie("user", JSON.stringify(args), 7);
				document.getElementById("sidebar-contain").classList.remove('hidden');
				
				Core.User.setup();
				Core.switchPage("/");
			} else {
				setTimeout(function() {
					/// handle errors
					// this.refs.username.setState({
					// 	isValid: false,
					// 	errors: [args.error]
					// });
					alert(args.error);

					this.refs.form.setState({ isSubmitting: false });
					this.setState({submitting:false});
				}.bind(this), 1500);
			}
		}.bind(this), 
		{ 
			timeout: 30000,
			timeoutMessage: "We're having some trouble logging you in - Exegeses might be down, or your internet might have been disconnected. Please refresh the page and try again.",
			vital: true
		});
		Socket.send("doLogin", model);
	},

	render: function() {

		var formConfig = {
			ref: "form",
			id: "login-form",
			onSubmit: this.handleSubmit,
			onValidateStateChange: (function(isValid) {
				this.setState({ isValid: isValid });
			}.bind(this)),
			defaultValidity: false,
			inputs: [
				/// username
				{
					ref: "username",
					className: "noValidationColorChange",
					type: "text",
					name: "username",
					placeholder: "Username",
					icon: "icon-user",
					required: true,
				},
				/// password
				{
					className: "noValidationColorChange",
					type: "password",
					name: "pin",
					placeholder: "PIN",
					icon: "icon-lock",
					required: true,
				}
			]
		};

		var submitButtonDisabled = this.state.submitting ? true : (this.state.isValid ? false : true);

		return (
			<div className="row">
				<div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
					<div className="card">
						<div className="card-header">
							Forcept
						</div>
						<div className="card-block">
							<h3 className="card-title">sign in</h3>
							<GenericForm ref="form" {...formConfig}>
								<div className="btn-group" role="group" aria-label="Basic example">
									<button type="submit" className="btn btn-primary btn-lg" disabled={submitButtonDisabled}>
										{ this.state.submitting ? "Logging in..." : "Log in" }
									</button>
									<button type="button" className="btn btn-link btn-lg">Help, it's not working!</button>
								</div>
							</GenericForm>
						</div>
					</div>
				</div>
			</div>
		);
	}
});


/**
 * HomePage
 */
var HomePage = React.createClass({
	render: function() {
		return (
			<div className="page-homepage">
				<h1>welcome back</h1>
			</div>
		);
	}
});