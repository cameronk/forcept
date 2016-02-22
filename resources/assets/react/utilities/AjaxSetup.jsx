/**
 * utilities/AjaxSetup.jsx
 * @author Cameron Kelley
 */

$( document ).ajaxError(function(event, jqxhr, settings, thrownError) {
    console.error("ajaxError: %O, %O, %O, %O", event, jqxhr, settings, thrownError);
});
