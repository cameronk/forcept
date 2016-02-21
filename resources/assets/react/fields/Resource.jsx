/**
 * fields/Resource.jsx
 * @author Cameron Kelley
 *
 * Properties:
 * - resouce: Resource object
 *
 * Format of resource object:
 *  {
 *		"type": [resource type],
 *		"data": [base64 data string]
 *	}
 */

Fields.Resource = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {
			isFetching: false,

			/*
			 * Cached object full of resources
			 * we've retrieved!
			 */
			cached: {},

			/*
			 * Current resource object.
			 */
			resource: {}
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {
		console.group("   Fields.Resource: mount (id=%s)", this.props.id);
			console.log("Props: %O", this.props);
			console.log("State: %O", this.state);
		console.groupEnd();
		this.setValue(this.props);
	},

	/*
	 *
	 */
	componentWillReceiveProps: function(newProps) {
		console.group("   Fields.Resource: receiveProps (id=%s)", this.props.id);
			console.log("Props: %O", newProps);
			console.log("State: %O", this.state);
		console.groupEnd();
		this.setValue(newProps);
	},

	/*
	 *
	 */
	setValue: function(props) {

		console.group("  Fields.Resource: setValue (id=%s)", this.props.id);
			console.log("Props: %O", props);
			console.log("State: %O", this.state);

		/*
		 * To display a resource object,
		 * we must have received the object as a property
		 * (and it can't be null)
		 */
		if(props.hasOwnProperty('resource')
			&& props.resource !== null
			&& typeof props.resource === "object") {

			var state = this.state,
				cached = state.cached;

			console.log("Cached resources: %O", cached);
			console.log("Extended resources: %O", jQuery.extend({}, cached));
			console.log("...keys: %s %s", Object.keys(cached), JSON.stringify(Object.keys(cached)));
			console.log("Does %s exist in cached? %s", props.id, cached.hasOwnProperty(props.id.toString));
			console.log("Does %s exist in cached array? %s", props.id, Object.keys(cached).indexOf(props.id));

			/*
			 * If we already have the resource cached...
			 */
			if(cached.hasOwnProperty(props.id)) {
				this.setState({
					resource: cached[props.id]
				});
			} else {

				/*
				 * Check for a valid data parameter.
				 */
				if(props.resource.hasOwnProperty('data') && props.resource.data.length > 0) {
					cached[props.id] = props.resource;
					this.setState({
						resource: props.resource,
						cached: cached
					});
				} else {
					this.fetchData();
				}

			}

			// /*
			//  * Push resource object to state.
			//  */
			// this.setState({
			// 	resource: props.resource
			// }, function() {
			//
			// 	var state = this.state;
			//
			// 	/*
			// 	 * Load data for resource if none found in resource object
			// 	 */
			// 	if(!state.resource.hasOwnProperty('data') || state.resource.data.length === 0) {
			// 		this.fetchData();
			// 	}
			//
			// }.bind(this));

		} else {

			/*
			 * Otherwise, reset state back to empty resource
			 */
			this.setState({
				resource: {}
			});

		}

		console.groupEnd();

	},

	/*
	 *
	 */
	fetchData: function() {

		var props = this.props,
			state = this.state;

		console.log("[Fields.Resource][" + props.id + "]: fetching data");

		this.setState({
			isFetching: true,
		});

		$.ajax({
			method: "GET",
			url: "/data/resources/fetch?id=" + props.id,
			success: function(resp) {

				var resource = state.resource;
					resource['type'] = resp.type;
					resource['data'] = resp.data;

				var cached = state.cached;
					cached[props.id] = resource;

				if(props.hasOwnProperty("handleStoreResource")) {
					// props.handleStoreResource(props.id, resource);
				}

				this.setState({
					isFetching: false,
					resource: resource,
					cached: cached,
				});

			}.bind(this),
			error: function(resp) {

			}.bind(this),
		});
	},

	/*
	 *
	 */
	render: function() {

		var props = this.props,
			state = this.state,
			resource = state.resource,
			renderResource = "Loading",
			loading = function() {
				renderResource = (
					<progress className="progress progress-striped progress-animated m-x-0 m-y-0" value="100" max="100">
						<div className="progress">
							<span className="progress-bar" style={{ "width": "100%" }}>Loading...</span>
						</div>
					</progress>
				);
			};

		console.log("[Fields.Resource][" + props.id + "]->render() with state:");
		console.log(state);

		if(resource !== null && typeof resource === "object") {

			/*
			 * Are we currently fetching?
			 */
			if(state.isFetching) {
				loading();
			} else {
				if(resource.hasOwnProperty('type')) {

					var type = resource.type;

					/*
					 * Check if this resource is an image.
					 */
					if(type.match("image/*")) {
						console.log("[Fields.Resource][" + props.id + "]: type matches image");

						if(resource.hasOwnProperty('data')) {
							try {
								renderResource = (
									<img src={resource.data} />
								);
							} catch(e) {
								renderResource = "error!";
							}
						} else {
							// Haven't fetched yet
							loading();
						}

					} else {
						// renderResource = (
						//
						// );
					}
				}
			}
		}

		return (
			<div className={"forcept-patient-photo-contain " + (props.hasOwnProperty("className") ? props.className : "")}>
				{renderResource}
			</div>
		);
	},
});
