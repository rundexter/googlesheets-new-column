var _ = require('lodash'),
    Spreadsheet = require('edit-google-spreadsheet');

module.exports = {
    checkAuthOptions: function (step, dexter) {

        if(!dexter.environment('google_spreadsheet'))
            return 'A [google_access_token, google_spreadsheet] environment variable is required for this module';

        return false;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('google').credentials(),
            error = this.checkAuthOptions(step, dexter);
        var spreadsheetId = dexter.environment('google_spreadsheet'),
            worksheetId = step.input('worksheet', 1).first(),
            numColumns = step.input('numColumns', 1).first();

        if (error) return this.fail(error);

        Spreadsheet.load({
            spreadsheetId: spreadsheetId,
            worksheetId: worksheetId,
            accessToken: {
                type: 'Bearer',
                token: _.get(credentials, 'access_token')
            }
        }, function (err, spreadsheet) {
            err? this.fail(err) : spreadsheet.metadata(function(error, metadata){
                error ? this.fail(error) : spreadsheet.metadata(
                    {
                        colCount: _.parseInt(metadata.colCount) + _.parseInt(numColumns)
                    },
                    function (err, metadata) {
                        err? this.fail(err) : this.complete(metadata);
                    }.bind(this));
            }.bind(this));
        }.bind(this))
    }
};
