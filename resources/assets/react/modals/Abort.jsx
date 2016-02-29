/**
 * modals/Abort.jsx
 * @author Cameron Kelley
 *
 * Modal that appears during a fatal error.
 *
 * Properties
 *   - error: semantic error object from Request
 *   - onClose: handler function for closing the modal.
 */

Modals.Abort = React.createClass({

    /*
     *
     */
    getDefaultProps: function() {
        return {
            onClose: function() {}
        };
    },

    /*
     * Define prop types.
     */
    propTypes: {

        /**
         * Required
         */
        error:   React.PropTypes.object.isRequired,

        /**
         * Optional
         */
        onClose: React.PropTypes.func,

    },

    /*
     *
     */
    getInitialState: function() {
        return {
            visible: false
        };
    },

    /*
     *
     */
    componentDidMount: function() {
        $("#modal-abort")
            .modal({
                backdrop: 'static',
                keyboard: false
            })
            .modal('show');
    },

    /*
     *
     */
    componentDidUpdate: function() {

        $("#modal-abort")
            .modal({
                backdrop: 'static',
                keyboard: false
            })
            .modal('show');

    },

    /*
     *
     */
    onClose: function() {
        this.props.onClose();

        $("#modal-abort")
            .modal('hide');
    },

    /*
     *
     */
    onRefresh: function() {
        window.location.reload();
    },

    /*
     *
     */
    render: function() {
        var props = this.props,
            allowRetry = (props.error.response.hasOwnProperty('allowRetry') && props.error.response.allowRetry === true);

        return (
            <div className="modal fade" id="modal-abort">
			    <div className="modal-dialog" role="document">
			        <div className="modal-content">
			            <div className="modal-header">
			                <h4 className="modal-title">
                                <span className="fa fa-exclamation-triangle text-danger"></span> {props.error.response.summary}
                            </h4>
			            </div>
			            <div className="modal-body alert alert-danger m-b-0">
			            	{props.error.response.details}
			            </div>
			            <div className="modal-footer">
                            <button type="button" className="btn btn-primary-outline" onClick={this.onRefresh}>
                                <span className="fa fa-refresh"></span> Refresh the page
                            </button>
			                {(allowRetry ? ( <button type="button" className="btn btn-danger-outline" onClick={this.onClose}>
			                	Try again
			                </button>) : "")}
			            </div>
			        </div>
			    </div>
			</div>
        )
    }

});
