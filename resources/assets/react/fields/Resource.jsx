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
			resource:{}
		};
	},

	/*
	 *
	 */
	componentWillMount: function() {
		this.setValue(this.props);
	},

	/*
	 *
	 */
	componentWillReceiveProps: function(newProps) {
		this.setValue(newProps);
	},

	/*
	 *
	 */
	setValue: function(props) {

		console.log("Caught setValue for resource");
		console.log("props: %O", props);

		/*
		 * To display a resource object,
		 * we must have received the object as a property
		 * (and it can't be null)
		 */
		if(props.hasOwnProperty('resource')
			&& props.resource !== null
			&& typeof props.resource === "object") {

			/*
			 * Push resource object to state.
			 */
			this.setState({
				resource: props.resource
			}, function() {

				/*
				 * Load data for resource if none found in resource object
				 */
				if(!props.resource.hasOwnProperty('data') || props.resource.data.length === 0) {
					console.log("HEADS UP: data not found for resource!");
					console.log(props);
					console.log(props.resource);
					console.log("typeof1: %s", typeof props.resource);
					console.log("hasOwnProperty('data'): %s", props.resource.hasOwnProperty('data'));
					console.log("typeof2: %s", typeof props.resource.data);
					console.log("typeof3: %s", typeof props.resource['data']);
					if(props.resource.hasOwnProperty('data'))
						console.log("length: %s", props.resource.data.length);
					this.fetchData();
				}

			}.bind(this));

		} else {

			/*
			 * Otherwise, reset state back to no resources
			 */
			this.setState({
				resource: {}
			});
		}
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

				if(props.hasOwnProperty("handleStoreResource")) {
					props.handleStoreResource(props.id, resource);
				}

				this.setState({
					isFetching: false,
					resource: resource
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
