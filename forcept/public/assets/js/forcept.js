/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug() {
	var compile = "";
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
			return statement === true;
		case "string":
			return statement === "true";
		default:
			return false;
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

Fields.FieldLabel = React.createClass({displayName: "FieldLabel",
	render: function() {
		var description;
		if(this.props.hasOwnProperty("description") && this.props.description !== null && this.props.description.length > 0) {
			description = (
				React.createElement("div", null, 
					React.createElement("small", {className: "text-muted"}, 
						this.props.description
					)
				)
			);
		}
		return (
			React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, 
				this.props.name, 
				description
			)
		)
	}
})

Fields.Text = React.createClass({displayName: "Text",
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "text", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextInputChange})
				)
			)
		);
	}
});

Fields.Textarea = React.createClass({displayName: "Textarea",
	onTextareaInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("textarea", {
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextareaInputChange})
				)
			)
		);
	}
});

Fields.Number = React.createClass({displayName: "Number",
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "number", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onNumberInputChange})
				)
			)
		);
	}
});

Fields.Date = React.createClass({displayName: "Date",
	onDateInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "date", 
						className: "form-control", 
						autoComplete: "off", 
						maxLength: "255", 

						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onDateInputChange})
				)
			)
		);
	}
});

Fields.Select = React.createClass({displayName: "Select",

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false
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
				React.createElement("option", {value: "__default__", disabled: "disabled"}, "Choose an option…")
			);

			// Custom data option (appended to select IF allowCustomData is set)
			if(isTrue(this.props.settings.allowCustomData)) {
				customDataOption = (
					React.createElement("option", {value: "__custom__"}, "Enter custom data for this field »")
				);
			}

			// Custom data input (show if custom data option select state is true)
			if(isTrue(this.state.isCustomDataOptionSelected)) {
				customDataInput = (
					React.createElement("input", {type: "text", className: "form-control", placeholder: "Enter custom data here", onChange: this.onCustomDataInputChange})
				);
			}
		}

		// Loop through and push options to optionsDOM
		optionsDOM = optionsKeys.map(function(optionKey, index) {
			var disabled = false;
			if(this.props.settings.options[optionKey].hasOwnProperty('available')) {
				disabled = (this.props.settings.options[optionKey].available == "true");
			}
			return (
				React.createElement("option", {value: options[optionKey].value, key: this.props.id + "-option-" + index, disabled: disabled}, options[optionKey].value)
			);
		}.bind(this));

		// Set size if this is a multiselect input
		var size = this.props.multiple ? (optionsKeys.length > 30 ? 30 : optionsKeys.length ) : 1;

		// Build the select input
		displaySelect = (
			React.createElement("select", {
				className: "form-control", 
				onChange: this.onSelectInputChange, 
				defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : (this.props.multiple ? [] : "__default__"), 
				multiple: this.props.multiple, 
				size: size}, 
					defaultOption, 
					optionsDOM, 
					customDataOption
			)
		);

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect, 
					customDataInput
				)
			)
		);
	}
});

Fields.File = React.createClass({displayName: "File",
	getInitialState: function() {
		return {
			isUploading: false,	// Are we uploading to the server?
			isParsing: false, 	// Are we parsing the file?
			resources: {}, 		// Already-uploaded objects
			files: [],			// Files pending upload
			uploadProgress: 0,	// Progress percentage of the current upload
			status: "",
			message: "",
		};
	},

	componentWillMount: function() {
		if(this.props.hasOwnProperty("defaultValue") && this.props.defaultValue !== null) {
			this.setState({
				resources: this.props.defaultValue
			});
		}
	},

	onFileInputChange: function(event) {

		// Remove any previous messages
		this.setState({
			status: "",
			message: "",
			isParsing: true
		});

		var files = event.target.files,
			filesLength = files.length,
			modifiedFiles = [],
			done = function() {
				console.log("[Fields.File] modifiedFiles count: " + modifiedFiles.length);
				this.setState({
					files: modifiedFiles,
					isParsing: false
				});
			}.bind(this);

		setTimeout(function() {
			for(var i = 0; i < filesLength; i++) {
				var thisFile = files[i],
					reader = new FileReader(),
					n = i;

				console.log("[Fields.File] working with file " + i);

				if(thisFile.type.match('image.*')) {

					var maxWidth = (this.props.hasOwnProperty("maxWidth") ? this.props.maxWidth : 310),
						maxHeight = (this.props.hasOwnProperty("maxHeight") ? this.props.maxHeight : 310);

					// onLoad: reader
					reader.onload = function(readerEvent) {

						console.log("[Fields.File][" + n + "] caught reader.onload");

						// Create a new image and load our data into it
						var image = new Image();

						// onLoad: image
						image.onload = function(imageEvent) {

							console.log("[Fields.File][" + n + "] caught image.onload");

							// Setup canvas element, grab width/height of image
							var canvas = document.createElement("canvas"),
								width = image.width,
								height = image.height;

							// Figure out what our final width / height should be
							if (width > height) {
								if (width > maxWidth) {
									height *= maxWidth / width;
									width = maxWidth;
								}
							} else {
								if (height > maxHeight) {
									width *= maxHeight / height;
									height = maxHeight;
								}
							}

							// Size our canvas appropriately
							canvas.width = width;
							canvas.height = height;

							console.log("[Fields.File][" + n + "] " + width + "x" + height);

							// Push image to canvas context
							canvas.getContext("2d").drawImage(image, 0, 0, width, height);

							console.log("[Fields.File][" + n + "] image/jpeg @ 0.5 is:");
							console.log(canvas.toDataURL("image/jpeg", 0.5));

							modifiedFiles[n] = canvas.toDataURL("image/jpeg", 0.5);

							if((n + 1) == filesLength) {
								done();
							}
						};

						image.src = readerEvent.target.result;

					};

					reader.readAsDataURL(thisFile);

				} else {
					reader.onload = function(evt) {
						modifiedFiles[n] = evt.target.result;
					};

					reader.readAsDataURL(thisFile);
				}

			}
		}.bind(this), 100);
	},

	/*
	 *
	 */
	handleUploadFiles: function() {
		// Set state as uploading this file.
		this.setState({
			isUploading: true,
			status: "",
			statusMessage: ""
		});

		var data = {};

		// Push all files loaded as inputs
		for(var i = 0; i < this.state.files.length; i++) {
			console.log("[Fields.File](handleUploadFiles) file " + i + " has data");
			console.log(this.state.files[i]);
			data["file-" + i] = this.state.files[i];
		}

		// Add CSRF token.
		data._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

		$.ajax({
			type: "POST",
			url: "/data/resources/upload",
			data: data,
			xhr: function() {
				var xhr = new window.XMLHttpRequest();

				xhr.upload.addEventListener("progress", function(evt) {
					if(evt.lengthComputable) {
						this.setState({
							uploadProgress: Math.round((evt.loaded * 100) / evt.total)
						});
					}
		       }.bind(this), false);

				return xhr;

			}.bind(this),
			success: function(resp) {
				var message = resp.hasOwnProperty("message") && typeof resp.message === "object" && resp.message !== null ? resp.message : {};
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					files: [],
					resources: message,
					status: "success",
					message: "File(s) uploaded successfully!"
				});
			}.bind(this),
			error: function(resp) {
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					status: "failure",
					message: "An error occurred during upload."
				});
			}.bind(this)
		});

	},

	handleRemoveResource: function(resourceID) {
		var resources = this.state.resources;
		if(resources.hasOwnProperty(resourceID)) {
			delete resources[resourceID];
		}

		this.setState({
			resources: resources,
			status: "",
			message: ""
		});
	},

	render: function() {
		var accept = "",
			files = this.state.files,
			filesCount = files.length,
			resources = this.state.resources,
			resourcesCount = Object.keys(resources).length,
			fileDisplay,
			statusMessage;

		// If we have an accept array, join it
		if(this.props.settings.hasOwnProperty("accept")) {
			accept = this.props.settings.accept.join();
		}

		if(this.state.status.length > 0 && this.state.message.length > 0) {
			var type = (this.state.status == "success" ? "success" : (this.state.status == "failure" ? "danger" : "info"));
			statusMessage = (
				React.createElement("div", {className: "alert alert-" + type}, 
					React.createElement("small", null, this.state.message)
				)
			);
		}

		// Figure out what to display.
		if(resourcesCount > 0) {
			// We have resources - don't show file input.
			var fileList = Object.keys(resources).map(function(resource, index) {
				return (
					React.createElement("div", {className: "list-group-item", key: ["file-", resource, "-", index].join()}, 
						"#", resource, " - ", resources[resource].type, 
						React.createElement("button", {onMouseUp: this.handleRemoveResource.bind(this, resource), className: "close pull-right"}, 
							"×"
						)
					)
				);
			}.bind(this));

			fileDisplay = (
				React.createElement("div", {className: "card"}, 
					React.createElement("ul", {className: "list-group list-group-flush"}, 
						fileList
					)
				)
			)
		} else {
			// Check if we're currently uploading
			if(!this.state.isUploading) {
				// No resources found - show file input.
				var uploadButton;

				if(filesCount > 0 || this.state.isParsing) {
					uploadButton = (
						React.createElement("div", null, 
							React.createElement("button", {type: "button", disabled: this.state.isParsing, className: "btn btn-sm btn-primary btn-block", onClick: this.handleUploadFiles}, 
								'\u21d1', " ", this.state.isParsing ? "Preparing files..." : "Upload"
							)
						)
					);
				}

				fileDisplay = (
					React.createElement("div", null, 
						React.createElement("label", {className: "file"}, 
							React.createElement("input", {type: "file", className: "form-control", accept: accept, onChange: this.onFileInputChange}), 
							React.createElement("span", {className: "file-custom"}, 
								filesCount > 0 ? filesCount + " files - " : ""
							)
						), 
						uploadButton
					)
				);
			} else {
				// No resources found - show file input.
				fileDisplay = (
					React.createElement("div", null, 
						React.createElement("h6", {className: "text-muted text-center m-t"}, 
							"Uploading ", filesCount, " ", filesCount === 1 ? "file" : "files", "..."
						), 
						React.createElement("progress", {className: "progress", value: this.state.uploadProgress, max: 100}, 
							React.createElement("div", {className: "progress"}, 
								React.createElement("span", {className: "progress-bar", style: { width: this.state.uploadProgress + "%"}}, 
									this.state.uploadProgress, "%"
								)
							)
						)
					)
				);
			}

		}

		// <h6>{this.state.fileSize > 0 ? getFileSize(this.state.fileSize) : ""}</h6>
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					fileDisplay, 
					statusMessage
				)
			)
		);
	}
});

Fields.YesNo = React.createClass({displayName: "YesNo",

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
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("div", {className: "btn-group btn-group-block", "data-toggle": "buttons"}, 
						React.createElement("label", {className: "btn btn-primary-outline" + (this.state.yes == true ? " active" : ""), onClick: this.onYesNoInputChange(true)}, 
							React.createElement("input", {type: "radio", 
								name: this.props.name + "-options", 
								autoComplete: "off", 

								defaultChecked: this.state.yes == true}), 
							"Yes"
						), 
						React.createElement("label", {className: "btn btn-primary-outline" + (this.state.yes == false ? " active" : ""), onClick: this.onYesNoInputChange(false)}, 
							React.createElement("input", {type: "radio", 
								name: this.props.name + "-options", 
								autoComplete: "off", 

								defaultChecked: this.state.yes == false}), 
							"No"
						)
					)
				)
			)
		);
	}
});

Fields.Header = React.createClass({displayName: "Header",
	render: function() {
		var description;
		if(this.props.hasOwnProperty('description') && description !== null) {
			description = (
				React.createElement("small", {className: "text-muted"}, this.props.description)
			);
		}
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("h3", {className: "forcept-fieldset-header"}, this.props.name, " ", description), 
				React.createElement("hr", null)
			)
		);
	}
});

Fields.Pharmacy = React.createClass({displayName: "Pharmacy",
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
			React.createElement("div", {className: "alert alert-info"}, 
				React.createElement("strong", null, "One moment..."), React.createElement("div", null, "loading the latest pharmacy data")
			)
		);

		if(dataKeys.length > 0) {
			selectDrugs = (
				React.createElement("select", {
					className: "form-control forcept-field-select-drugs", 
					multiple: true, 
					size: 10, 
					onChange: this.onSelectedDrugsChange}, 

					dataKeys.map(function(drugKey, index) {
						var thisCategory = this.state.data[drugKey];

						if(thisCategory.hasOwnProperty('settings')
							&& thisCategory.settings.hasOwnProperty('options')
							&& thisCategory.settings.options !== null) {

							var optionKeys = Object.keys(thisCategory.settings.options);
							return (
								React.createElement("optgroup", {label: this.state.data[drugKey].name}, 
									optionKeys.map(function(optionKey, index) {
										// var size = optionKeys.length > 30 ? 30 : optionKeys.length;
										var thisOption = thisCategory.settings.options[optionKey];
										var disabled = thisOption.available == "false";
										var displayName = thisOption.value + (parseInt(thisOption.count) > 0 && thisOption.available ? "\u2014 " + thisOption.count : "")

										if(!disabled) {
											return (
												React.createElement("option", {value: thisOption.value}, 
													displayName
												)
											);
										}

									}.bind(this))
								)
							);
						}

					}.bind(this))
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement(Fields.FieldLabel, React.__spread({},  this.props)), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					selectDrugs
				)
			)
		);
	}
});
