/**
 * fields/File.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - onChange (function): 	handle successful file upload
 * - onStore (function): 	handle individual file storage
 */

Fields.File = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {
			isUploading: false,	// Are we uploading to the server?
			isParsing: false, 	// Are we parsing the file?
			resources: [], 		// Already-uploaded objects
			files: [],			// Files pending upload
			uploadProgress: 0,	// Progress percentage of the current upload
			status: "",
			message: "",
			_storage: {},		// Store resources by their ID
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {
		console.group("  Fields.File: componentWillMount '%s'", this.props.name);
		this.setValue(this.props);
		console.groupEnd();
	},

	/*
	 *
	 */
	componentWillReceiveProps: function(newProps) {
		console.group("  Fields.File: componentWillReceiveProps '%s'", newProps.name);
		this.setValue(newProps);
		console.groupEnd();
	},

	/*
	 *
	 */
	setValue: function(props) {
		console.log("Props: %O", props);
		console.log("State: %O", this.state);
		if(props.hasOwnProperty("value") && props.value !== null && Array.isArray(props.value)) {
			console.log("Pre-existing resources value located. Applying to state.");
			this.setState({
				resources: props.value,
				status: "",
				message: "",
				isParsing: false
			});
		} else {
			console.log("No resources located. Resetting resources array.");
			this.setState({
				resources: [],
				status: "",
				message: "",
				isParsing: false
			});
		}
	},

	/*
	 * Remove any previously applied messages
	 */
	resetMessages: function() {
		this.setState({
			status: "",
			message: "",
			isParsing: true
		});
	},

	/*
	 *
	 */
	onFileInputChange: function(event) {

		var props = this.props,
			state = this.state,
			files = event.target.files,
			filesLength = files.length,
			modifiedFiles = [],
			done = function() {
				console.log("Completed file processing loop.");
				console.log("Modified file count: %s", modifiedFiles.length);
				this.setState({
					files: modifiedFiles,
					isParsing: false
				});
			}.bind(this);

		console.group("  Fields.File: onFileInputChange '%s'", props.name);
		this.resetMessages();

		// Loop through all files loaded into input
		for(var i = 0; i < filesLength; i++) {

			var thisFile = files[i], // Grab the file from our files array
				reader = new FileReader(), // Initialize a new FileReader
				n = i; // Store index to prevent loop completion checking problems

			if(thisFile.type.match('image.*')) {

				var maxWidth = (props.hasOwnProperty("maxWidth") ? props.maxWidth : 310),
					maxHeight = (props.hasOwnProperty("maxHeight") ? props.maxHeight : 310);

				// onLoad: reader
				reader.onload = function(readerEvent) {

					// Create a new image and load our data into it
					var image = new Image();

					// onLoad: image
					image.onload = function(imageEvent) {

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

						// console.log("Size: %spx by %spx", width, height);

						// Push image to canvas context
						canvas.getContext("2d").drawImage(image, 0, 0, width, height);

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

			console.groupEnd(); // end file #%i

		}

		console.groupEnd(); // end onFileInputChange

	},

	/*
	 *
	 */
	handleUploadFiles: function() {

		var props = this.props,
			state = this.state,
			data = {};

		console.group("  Fields.File: handleUploadFiles '%s'", props.name);

		// Set state as uploading this file.
		this.setState({
			isUploading: true,
			status: "",
			statusMessage: ""
		});

		// Push all loaded files to data object for uploading.
		for(var i = 0; i < state.files.length; i++) {
			console.group("...file #%i", i);
			console.log("Data: %s", state.files[i]);
			console.groupEnd();
			data["file-" + i] = state.files[i];
		}

		// Add CSRF token.
		data._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

		$.ajax({
			type: "POST",
			url: "/data/resources/upload",
			data: data,
			xhr: function() {

				// Grab XHR object from window
				var xhr = new window.XMLHttpRequest();

				// TODO fix this
				xhr.addEventListener("progress", function(evt) {
					if(evt.lengthComputable) {
						var progress = Math.round(evt.loaded / evt.total);
						console.log("[Fields.File]->handleUploadFiles(): progress=" + progress);
						this.setState({
							uploadProgress: progress
						});
					}
		       }.bind(this), false);

				return xhr;

			}.bind(this),
			success: function(resp) {
				var resources = resp.hasOwnProperty("message") && typeof resp.message === "object" && resp.message !== null ? resp.message : {};
				var resourceKeys = Object.keys(resources);
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					files: [],
					resources: resourceKeys,
					_storage: resources,
					status: "success",
					message: "File(s) uploaded successfully!"
				}, function() {
					props.onChange(props.id, resourceKeys);
					for(i = 0; i < resourceKeys.length; i++) {
						var k = resourceKeys[i];
						props.onStore(k, resources[k]);
					}
				});
			}.bind(this),
			error: function(resp) {
				this.setState({
					isUploading: false,
					uploadProgress: 0,
					status: "failure",
					message: "An error occurred during upload."
				});
			}.bind(this),
			complete: function() {
				console.groupEnd(); // end handleUploadFiles
			}
		});

		console.groupEnd(); // end handleUploadFiles
	},

	/*
	 *
	 */
	handleRemoveResource: function(resourceID) {
		var storage = this.state._storage,
			resources = this.state.resources,
			index = resources.indexOf(resourceID);

		if(storage.hasOwnProperty(resourceID)) {
			delete storage[resourceID];
		}
		if(index !== -1) {
			resources.splice(index, 1);
		}

		this.setState({
			resources: resources,
			_storage: storage,
			status: "",
			message: ""
		}, function() {
			this.props.onChange(this.props.id, resources);
		}.bind(this));
	},

	/*
	 *
	 */
	render: function() {
		var props = this.props,
			state = this.state,
			settings = props.settings,
			accept = "",
			files = this.state.files,
			filesCount = files.length,
			resources = this.state.resources,
			storage = this.state._storage,
			resourcesCount = resources.length,
			fileDisplay,
			statusMessage;

		// If we have an accept array, join it
		if(settings.hasOwnProperty("accept")) {
			accept = settings.accept.join();
		}

		if(state.status.length > 0 && state.message.length > 0) {
			var type = (state.status == "success" ? "success" : (state.status == "failure" ? "danger" : "info"));
			statusMessage = (
				<div className={"alert alert-" + type}>
					<small>{state.message}</small>
				</div>
			);
		}

		// Figure out what to display.
		if(resourcesCount > 0) {
			// We have resources - don't show file input.
			var fileList = resources.map(function(resource, index) {
				var thisType;
				if(storage.hasOwnProperty(resource) && storage[resource].hasOwnProperty("type")) {
					thisType = storage[resource].type;
				}
				return (
					<div className="list-group-item" key={["file-", resource, "-", index].join()}>
						<span className="label label-default m-r">{resource}</span>
						<small>{thisType}</small>
						<button onMouseUp={this.handleRemoveResource.bind(this, resource)} className="close pull-right">
							&times;
						</button>
					</div>
				);
			}.bind(this));

			fileDisplay = (
				<div className="card">
					<ul className="list-group list-group-flush">
						{fileList}
					</ul>
				</div>
			)
		} else {
			// Check if we're currently uploading
			if(!state.isUploading) {

				// No resources found - show file input.
				var uploadButton;

				if(filesCount > 0 || state.isParsing) {
					uploadButton = (
						<div>
							<button type="button" disabled={state.isParsing} className="btn btn-sm btn-primary btn-block" onClick={this.handleUploadFiles}>
								{'\u21d1'} {state.isParsing ? "Preparing files..." : "Upload"}
							</button>
						</div>
					);
				}

				fileDisplay = (
					<div>
						<label className="file">
							<input type="file" className="form-control" accept={accept} onChange={this.onFileInputChange} />
							<span className="file-custom">
								{filesCount > 0 ? filesCount + " files - " : ""}
							</span>
						</label>
						{uploadButton}
					</div>
				);
			} else {
				// No resources found - show file input.
				fileDisplay = (
					<div>
						<h6 className="text-muted text-center m-t">
							Uploading {filesCount} {filesCount === 1 ? "file" : "files"}...
						</h6>
						<progress className="progress" value={state.uploadProgress} max={100}>
							<div className="progress">
								<span className="progress-bar" style={{ width: state.uploadProgress + "%" }}>
									{state.uploadProgress}%
								</span>
							</div>
						</progress>
					</div>
				);
			}

		}

		return (
			<div className="form-group row">
				<Fields.FieldLabel {...props} />
				<div className={Fields.inputColumnClasses}>
					{fileDisplay}
					{statusMessage}
				</div>
			</div>
		);
	}
});
