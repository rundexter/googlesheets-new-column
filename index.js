var _ = require('lodash'),
    Spreadsheet = require('edit-google-spreadsheet');

module.exports = {
    checkAuthOptions: function (step, dexter) {

        if(!dexter.environment('google_access_token') || !dexter.environment('google_spreadsheet')) {

            this.fail('A [google_access_token, google_spreadsheet] environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var spreadsheetId = dexter.environment('google_spreadsheet');


        var worksheetId = step.input('worksheet', 1).first(),
            numColumns = step.input('numColumns', 1).first();

        this.checkAuthOptions(step, dexter);

        Spreadsheet.load({
            spreadsheetId: spreadsheetId,
            worksheetId: worksheetId,
            accessToken: {
                type: 'Bearer',
                token: dexter.environment('google_access_token')
            }
        }, function (err, spreadsheet) {

            if (err) {

                this.fail(err);
            } else {

                spreadsheet.metadata(function(err, metadata){
                    if(err) {

                        this.fail(err);
                    } else {

                        spreadsheet.metadata({
                            colCount: _.parseInt(metadata.colCount) + _.parseInt(numColumns)
                        }, function(err, metadata){

                            if(err)
                                this.fail(err);
                            else
                                this.complete(metadata);
                        }.bind(this));
                    }
                }.bind(this));
            }

        }.bind(this))
    }
};
