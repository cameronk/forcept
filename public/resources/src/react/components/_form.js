/**
 * Forcept
 * react components: _form.js
 */

var GenericContainedInput = React.createClass({
	getInitialState: function() {
		return {
			value: this.props.value || '',
			hasBeenBlurred: false,
		};
	},
	componentWillMount: function() {
		console.log("[components/_form.js] GenericContainedInput: mounting " + this.props.name + " (" + this.state.value + ")");
	}, 

	componentWillUnmount: function() {
		console.log("[components/_form.js] GenericContainedInput: unmounting " + this.props.name);
	},

	setValue: function(event) {
		console.log(" ");
		console.log("[components/_form.js] setValue: " + this.props.name);
		
		function stateUpdateAndValidate(that) {
			console.log("[components/_form.js] validating AND updating state for " + that.props.name);
			that.setState({
				value: event.currentTarget.value,
				hasBeenBlurred: true
			}, function() {
				that.validate();
			}.bind(that));
		};
		function stateUpdate(that) {
			console.log("[components/_form.js] updating state for " + that.props.name);
			that.setState({
				value: event.currentTarget.value
			});
		};

		if(event.currentTarget.value.length > 0) {
			/// if the input is lazy, validate only on blur first time around
			/// if the input is eager (no value specified), validate on change
			if(this.props.hasOwnProperty("lazy") && this.state.hasBeenBlurred == false) {
				
				/// onBlur
				if(event.type == "blur") {
					console.log("[components/_form.js]   | setValue for lazy input -> event: blur");
					stateUpdateAndValidate(this);
				} else {
					console.log("[components/_form.js]   | setValue for lazy input -> event: change");
					stateUpdate(this);
				}
			} else {
				stateUpdateAndValidate(this);
			}
		} else stateUpdateAndValidate(this);
	},

	validate: function() {
		if(!this.props.validations && !this.props.required) {
			return;
		}

		var errors = [];

		function pushError(error) {
			errors.push(error);
		}

		/// if this this has a value or is required
		if(this.props.value || this.props.required) {

			/// check if passes required
			if(this.props.required && this.state.value.length == 0) 
				pushError( "This field is required");

			if(this.props.validations) {
				/// start handling validation rules
				this.props.validations.split(',').forEach(function(validation) {

					var args = validation.split(':');
					var validateMethod = args.shift();

					console.log("[components/_form.js]     method: " + validateMethod + " " + JSON.stringify(args));

					// args = args.map(function(arg) { return JSON.parse(arg); });
					var call = [this.state.value].concat(args);

					/// make sure the method exists, or if we have a custom one
					if(window["validator"].hasOwnProperty(validateMethod) || ["regex", "matches"].indexOf(validateMethod) !== -1) {

						switch(validateMethod) {
							case "regex":
								console.log("[components/_form.js]           : regex method");
								console.log("[components/_form.js]           : " + Exegeses.regex[args[0]].toString());

								if(validator.matches(this.state.value, Exegeses.regex[args[0]]) !== true) {
									pushError(Exegeses.validationErrors.regex[this.props.name]);
								}
								break;
							case "matches": 
								if(validator.equals(this.state.value, document.querySelector("input[name='" + args[0] + "']").value ) !== true) {
									console.log("[components/_form.js]           : error");
									pushError(Exegeses.validationErrors.get("matches", args, {props: {name: this.props.name}}));
								}
								break;
							default:
								console.log("[components/_form.js]           : default method");
								if(window["validator"][validateMethod].apply(validator, call) !== true ) {
									console.log("[components/_form.js]           : error");
									pushError(Exegeses.validationErrors.get(validateMethod, args, this));
								}
								break;
						}
						
					} else console.log("[components/_form.js] tried to run validator " + validateMethod + " on this " + this.props.name);

				});
			}

		} else {
			console.log("[components/_form.js] skipping " + this.props.name);
		}

		console.log("[components/_form.js]   " + this.props.name + " is " + (Object.keys(errors).length == 0 ? '' : 'not ') + "valid (" + Object.keys(errors).length + ") [length: " + this.state.value.length + "]");
		console.log("[components/_form.js]   " + JSON.stringify(errors));
		this.setState({
			isValid: (Object.keys(errors).length == 0),
			errors: errors
		}, function() {
			if(this.props.hasOwnProperty("onValidate")) {
				this.props.onValidate(this);
			}
		});
	},

	render: function() {
		var errorBubble = (
			<span></span>
		);
		
		/// make sure we have a state value set, otherwise this is initial load 
		if(this.state.hasOwnProperty("isValid")) {
			if(this.state.isValid !== true) {

				var errors = this.state.errors.map(function(error, i) {
					return (
						<span key={i}>{error}</span>
					);
				}, this);

				errorBubble = (
					<div className="input-group-addon label label-danger">
						{errors}
					</div>
				);
			}
		}

		var className = "form-group";
		if(this.props.className) 
			className += " " + this.props.className;
		

		return (
			<fieldset className={className} data-valid={this.state.isValid} data-blurred={this.state.hasBeenBlurred} ref={"input-" + this.props.name}>
				<div className="input-group">
					<div className="input-group-addon"></div>
					<input type={this.props.type} 
						name={this.props.name} 
						placeholder={this.props.placeholder}
						value={this.state.value} 
						onChange={this.setValue} 
						onBlur={this.setValue}
						autoComplete="off"
						spellCheck="false"
						className="form-control form-control-lg"
					/>
	    			{ errorBubble }
	    		</div>
			</fieldset>
		);
	}
});

var GenericForm = React.createClass({

	getInitialState: function() {
		return {
			isSubmitting: false,
			isValid: this.props.defaultValidity
		};
	},

	componentWillMount: function() {
		this.model = {};
		this.inputs = {};
	},

	componentDidMount: function() {
		this.props.inputs.map(function(input) {
			this.inputs[input.name] = this.defaultValidity;
		}.bind(this));
	},

	validateForm: function(input) {
		console.log(this.inputs);
		this.inputs[input.props.name] = (input.state.hasOwnProperty('isValid') ? input.state.isValid : this.props.defaultValidity);
		this.model[input.props.name] = input.state.value;
		console.log(" | ");
		console.log(" V ");
		console.log(this.inputs);

		var isValid = true;
		for(var key in this.inputs) {
			if(this.inputs[key] !== true)
				isValid = false;
		}

		// Pass this state change down to the child
		if(this.props.hasOwnProperty("onValidateStateChange")) {
			this.props.onValidateStateChange(isValid);
		}

		this.setState({
			isValid: isValid
		});

	},

	submit: function(event) {
		console.log("[components/_form.js] GenericForm: caught submit");
		event.preventDefault();
		console.log("[components/_form.js] --> model:")
		console.log(this.model);
		// this.updateModel();

		console.log("[components/_form.js] --> isValid=" + this.state.isValid);

		/// Ensure we're allowed to submit before doing so
		if(this.state.isValid == true) {
			this.state.isSubmitting = true;
			this.props.onSubmit(this.model);
		}
	},

	render: function() {
		var internalFormConfig = {
			autoComplete: "off",
			id: this.props.id,

			// onSubmit prop passed from parent is called in this.submit()
			onSubmit: this.submit,
		}
		return (
			<form {...internalFormConfig} data-valid={this.state.isValid} data-submitting={this.state.isSubmitting}>
				{
					this.props.inputs.map(function(input) {
						return (
							<GenericContainedInput {...input} onValidate={this.validateForm} />
						);
					}.bind(this))
				}
				{this.props.children}
			</form>
		);
	}
});