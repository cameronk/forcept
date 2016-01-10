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

function getFileSize(n,a,b,c,d){
	return (a=a?[1e3,'k','B']:[1024,'K','iB'],b=Math,c=b.log,
	d=c(n)/c(a[0])|0,n/b.pow(a[0],d)).toFixed(2)
	+' '+(d?(a[1]+'MGTPEZY')[--d]+a[2]:'Bytes');
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
				<div><small className="text-muted">{this.props.description}</small></div>
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
			//customDataInputValue: "",
		};
	},

	onSelectInputChange: function(event) {

		if(this.props.multiple == true) {

			var options = event.target.options;
			var values = [];
			for(var i = 0; i < options.length; i++) {
				if(options[i].selected) {
					values.push(options[i].value);
				}
			}

			/*var customDataSelectedIndex = values.indexOf("__custom__");

			if(customDataSelectedIndex !== -1) {
				console.log("onSelectInputChange: found customDataSelectedIndex @ " + customDataSelectedIndex);
				console.log("Current customDataInputValue is " + customDataInputValue);
				// Custom data is selected, remove from array and put text input value in its place
				values.splice(customDataSelectedIndex, 1);
				values.push(this.state.customDataInputValue);
			}

			console.log("onSelectInputChange: Values are currently: ");
			console.log(values);

			this.setState({
				isCustomDataOptionSelected: customDataSelectedIndex !== -1
			});*/
			this.props.onChange(this.props.id, values);

		} else {
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
		}
	},

	onCustomDataInputChange: function(event) {
		/*console.log("Caught customDataInputChange: " + event.target.value);
		this.setState({
			customDataInputValue: event.target.value
		});*/
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var options,
			optionsKeys,
			optionsDOM,
			displaySelect,
			defaultOption,
			customDataOption,
			customDataInput;

		if(this.props.settings.hasOwnProperty('options')) {
			options = this.props.settings.options;
			optionsKeys = Object.keys(options);
		} else {
			options = {};
			optionsKeys = [];
		}

		// Default option (prepended to select)
		if(this.props.multiple == false) {

			defaultOption = (
				<option value="__default__" disabled="disabled">Choose an option&hellip;</option>
			);

			// Custom data option (appended to select IF allowCustomData is set)
			if(isTrue(this.props.settings.allowCustomData)) {
				customDataOption = (
					<option value="__custom__">Enter custom data for this field &raquo;</option>
				);
			}

			// Custom data input (show if custom data option select state is true)
			if(isTrue(this.state.isCustomDataOptionSelected)) {
				customDataInput = (
					<input type="text" className="form-control" placeholder="Enter custom data here" onChange={this.onCustomDataInputChange} />
				);
			}
		}

		// Loop through and push options to optionsDOM
		optionsDOM = optionsKeys.map(function(optionKey, index) {
			return (
				<option value={options[optionKey].value} key={this.props.id + "-option-" + index}>{options[optionKey].value}</option>
			);
		}.bind(this));

		// Set size if this is a multiselect input
		var size = this.props.multiple ? (optionsKeys.length > 30 ? 30 : optionsKeys.length ) : 1;
		
		// Build the select input
		displaySelect = (
			<select 
				className="form-control" 
				onChange={this.onSelectInputChange} 
				defaultValue={this.props.defaultValue !== null ? this.props.defaultValue : (this.props.multiple ? [] : "__default__")}
				multiple={this.props.multiple}
				size={size}>
					{defaultOption}
					{optionsDOM}
					{customDataOption}
			</select>
		);

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					{displaySelect}
					{customDataInput}
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
					<h6>{this.state.fileSize > 0 ? getFileSize(this.state.fileSize) : ""}</h6>
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

Fields.Header = React.createClass({
	render: function() {
		var description;
		if(this.props.hasOwnProperty('description') && description !== null) {
			description = (
				<small className="text-muted">{this.props.description}</small>
			);
		}
		return (
			<div className="form-group row">
				<h3 className="forcept-fieldset-header">{this.props.name} {description}</h3>
				<hr/>
			</div>
		);
	}
});

Fields.Pharmacy = React.createClass({
	getInitialState: function() {
		return {
			data: {}
		};
	},
	updateList: function() {
		$.ajax({
			type: "GET",
			url: "/data/pharmacy/drugs",
			data: {

			},
			success: function(resp) {
				if(resp.status == "success") {
					__debug(resp.data);
					this.setState({
						data: resp.data
					});
				}
			}.bind(this),
			error: function() {

			},
			complete: function() {

			}
		});
	},
	componentWillMount: function() {
		this.updateList();
	},

	onSelectedDrugsChange: function(event) {
		console.log("Selected drugs change:");
		var options = event.target.options;
		var values = [];
		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}
		console.log(values);
		this.props.onChange(this.props.id, values);
	},

	render: function() {
		var dataKeys = Object.keys(this.state.data);
		var selectDrugs = (
			<div className="alert alert-info">
				<strong>One moment...</strong><div>loading the latest pharmacy data</div>
			</div>
		);

		if(dataKeys.length > 0) {
			selectDrugs = (
				<select 
					className="form-control forcept-field-select-drugs" 
					multiple={true} 
					size={10} 
					onChange={this.onSelectedDrugsChange}>

					{dataKeys.map(function(drugKey, index) {
						var thisCategory = this.state.data[drugKey];

						if(thisCategory.hasOwnProperty('settings') 
							&& thisCategory.settings.hasOwnProperty('options')
							&& thisCategory.settings.options !== null) {

							var optionKeys = Object.keys(thisCategory.settings.options);
							return (
								<optgroup label={this.state.data[drugKey].name}>
									{optionKeys.map(function(optionKey, index) {
										// var size = optionKeys.length > 30 ? 30 : optionKeys.length;
										var thisOption = thisCategory.settings.options[optionKey];
										var disabled = thisOption.available == "false";
										var displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

										return (
											<option value={thisOption.value} disabled={disabled}>
												{displayName}	
											</option>
										);
									}.bind(this))}
								</optgroup>
							);
						}

					}.bind(this))}
				</select>
			);
		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...this.props} />
				<div className={Fields.inputColumnClasses}>
					{selectDrugs}
				</div>
			</div>
		);
	}
});