/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug() {
	var compile = ""
	for(var i = 0; i < arguments.length; i++) {
		var data = arguments[i];
		if(typeof data == "object" && data !== null) {
			data = JSON.stringify(data, null, "  ");
		}
		compile += (data + "<br/><br/>");
	}
	$("#forcept-debug-content pre").html(compile);
}

function isTrue(statement) {
	switch(typeof statement) {
		case "boolean":
			return statement == true;
			break;
		case "string":
			return statement === "true";
			break;
		default:
			return false;
			break;
	}
}

function base64bytes(string) {
	var splitHeadAndData = string.split(',');
	return Math.round( (splitHeadAndData[1].length - splitHeadAndData[0].length) * 0.75 );
}

/* ========================================= */

var Fields = {
	labelColumnClasses: "col-lg-4 col-sm-5 col-xs-12",
	inputColumnClasses: "col-lg-8 col-sm-7 col-xs-12"
};

Fields.FieldLabel = React.createClass({
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				<div><small>{this.props.description}</small></div>
			);
		}
		return (
			<label htmlFor={this.props.id} className={Fields.labelColumnClasses + " form-control-label"}>
				{this.props.name}
				{description}
			</label>
		)
	}
})

Fields.Text = React.createClass({
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input 
						type="text" 
						className="form-control" 
						autoComplete="off"
						maxLength="255"

						id={this.props.id} 
						placeholder={this.props.name + " goes here"} 
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onTextInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Textarea = React.createClass({
	onTextareaInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<textarea
						className="form-control"
						autoComplete="off"
						maxLength="255"

						id={this.props.id} 
						placeholder={this.props.name + " goes here"} 
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onTextareaInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Number = React.createClass({
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input 
						type="number" 
						className="form-control" 
						autoComplete="off"
						maxLength="255"

						id={this.props.id} 
						placeholder={this.props.name + " goes here"} 
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onNumberInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Date = React.createClass({
	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<input 
						type="date" 
						className="form-control" 
						autoComplete="off" 
						maxLength="255"

						id={this.props.id} 
						placeholder={this.props.name + " goes here"}
						defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : null}
						onChange={this.onDateInputChange} />
				</div>
			</div>
		);
	}
});

Fields.Select = React.createClass({

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false,
		};
	},

	onSelectInputChange: function(event) {

		// Check value before bubbling.
		switch(event.target.value) {
			case "__default__":
				// Spoof event target value
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, "");
				break;
			case "__custom__":
				// Set top-level state value to nothing (so it says "No data")
				this.setState({ isCustomDataOptionSelected: true });
				this.props.onChange(this.props.id, "");
				break;
			default:
				// Bubble event up to handler passed from Visit
				// (pass field ID and event)
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, event.target.value);
				break;
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var options,
			displaySelect;

		// Default option (prepended to select)
		var defaultOption = (
			<option value="__default__" disabled="disabled">Choose an option&hellip;</option>
		);
		// Custom data option (appended to select IF allowCustomData is set)
		var customDataOption = (
			<option value="__custom__">Enter custom data for this field &raquo;</option>
		);

		// Custom data input 
		var customDataInput = (
			<input type="text" className="form-control" placeholder="Enter custom data here" onChange={this.onCustomDataInputChange} />
		);

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					<option value={option} key={this.props.id + "-option-" + index}>{option}</option>
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				<select className="form-control" onChange={this.onSelectInputChange} defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : "__default__"}>
					{defaultOption}
					{options}
					{isTrue(this.props.settings.allowCustomData) ? customDataOption : ""}
				</select>
			);
		} else {
			displaySelect = (
				<div className="alert alert-danger">
					<strong>Warning:</strong> no options defined for select input {this.props.id}
				</div>
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					{displaySelect}
					{isTrue(this.state.isCustomDataOptionSelected) ? customDataInput : ""}
				</div>
			</div>
		);
	}
});

Fields.MultiSelect = React.createClass({

	getInitialState: function() {
		return {};
	},

	onSelectInputChange: function(event) {
		var options = event.target.options;
		var values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}

		this.props.onChange(this.props.id, values);
	},

	render: function() {

		var options,
			displaySelect;

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					<option value={option} key={this.props.id + "-option-" + index}>{option}</option>
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				<select className="form-control" onChange={this.onSelectInputChange} multiple={true} defaultValue={this.props.defaultValue}>
					{options}
				</select>
			);
		} else {
			displaySelect = (
				<div className="alert alert-danger">
					<strong>Warning:</strong> no options defined for select input {this.props.id}
				</div>
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					{displaySelect}
				</div>
			</div>
		);
	}
});

Fields.File = React.createClass({
	getInitialState: function() {
		return {
			fileCount: 0,
			fileSize: 0,
		};
	},

	componentWillMount: function() {
		if(this.props.hasOwnProperty("defaultValue") && this.props.defaultValue !== null) {
			this.setState({
				fileCount: 1,
				fileSize: base64bytes(this.props.defaultValue)
			});
		}
	},

	onFileInputChange: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function(upload) {
			console.log("Reader onload return upload target result:");
			console.log(upload.target.result);
			this.setState({ 
				fileCount: 1, 
				fileSize: base64bytes(upload.target.result)
			});
			this.props.onChange(this.props.id, upload.target.result);
		}.bind(this);

		reader.readAsDataURL(file);
	},

	render: function() {
		var accept = "";
		if(this.props.settings.hasOwnProperty("accept")) {
			accept = this.props.settings.accept.join();
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<label className="file">
						<input type="file" className="form-control" accept={accept} onChange={this.onFileInputChange} />
						<span className="file-custom">{this.state.fileCount == 0 ? "No files - " : this.state.fileCount + " file - " + (this.state.fileCount == 1 ? "" : "s")}</span>
					</label>
					<h6>{this.state.fileSize > 0 ? this.state.fileSize + " bytes" : ""}</h6>
				</div>
			</div>
		);
	}
});

Fields.YesNo = React.createClass({

	getInitialState: function() {
		return {
			yes: null,
		};
	},

	componentWillMount: function() {
		// If data, set
		if(this.props.hasOwnProperty('defaultValue') 
			&& this.props.defaultValue !== null
			&& ["yes", "no"].indexOf(this.props.defaultValue.toLowerCase()) !== -1) {
			this.setState({
				yes: this.props.defaultValue.toLowerCase() == "yes"
			});
		}
	},

	onYesNoInputChange: function(status) {
		return function(evt) {
			console.log("Caught yes/no input change -> " + status);

			this.setState({
				yes: status
			});

			this.props.onChange(this.props.id, status ? "Yes" : "No");

		}.bind(this);
	},

	render: function() {
		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					<div className="btn-group btn-group-block" data-toggle="buttons">
						<label className={"btn btn-primary-outline" + (this.state.yes == true ? " active" : "")} onClick={this.onYesNoInputChange(true)}>
							<input type="radio" 
								name={this.props.name + "-options"} 
								autoComplete="off" 
									
								defaultChecked={this.state.yes == true} /> 
							Yes
						</label>
						<label className={"btn btn-primary-outline" + (this.state.yes == false ? " active" : "")} onClick={this.onYesNoInputChange(false)} >
							<input type="radio" 
								name={this.props.name + "-options"} 
								autoComplete="off" 

								defaultChecked={this.state.yes == false} /> 
							No
						</label>
					</div>
				</div>
			</div>
		);
	}
});