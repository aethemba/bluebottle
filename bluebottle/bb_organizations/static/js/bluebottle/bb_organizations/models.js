App.Adapter.map('App.MyOrganization', {
    documents: {embedded: 'load'}
});

App.Adapter.map('App.MyOrganizationDocument', {
    file: {embedded: 'load'}
});


App.Organization = DS.Model.extend({
    url: 'bb_organizations',
    name: DS.attr('string'),
    description: DS.attr('string', {defaultValue: ""}),

    // Internet
    website: DS.attr('string', {defaultValue: ""}),
    facebook: DS.attr('string', {defaultValue: ""}),
    twitter: DS.attr('string', {defaultValue: ""}),

    websiteUrl: function(){
        var website = this.get('website');
        if (website) {
            if (website.substr(0, 4) != 'http') {
                return 'http://' + website;
            }
            return website;
        }
        return "";
    }.property('website'),

    facebookUrl: function(){
        var facebook = this.get('facebook');
        if (facebook) {
            if (facebook.substr(0, 4) != 'http') {
                return 'http://' + facebook;
            }
            return facebook;
        }
        return "";
    }.property('facebook'),

    twitterUrl: function(){
        var twitter = this.get('twitter');
        if (twitter) {
            //Assumes input was of the form: @handle (conforming to the placeholder text)
            return 'http://twitter.com/' + twitter.substr(1);

        }
        return "";
    }.property('twitter'),

    // Legal
    legalStatus: DS.attr('string', {defaultValue: ""})

});


App.MyOrganizationDocument = DS.Model.extend({
    url: 'bb_organizations/documents/manage',

    organization: DS.belongsTo('App.MyOrganization'),
    file: DS.attr('file')
});

App.MyOrganization = DS.Model.extend(App.ModelValidationMixin, {
    url: 'bb_organizations/manage',
    requiredOrganizationFields: ['name', 'email', 'phone_number', 'website'],
	requiredBaseBankOrganizationFields: ['account_holder_name', 'account_holder_address', 'account_holder_postal_code',
									 'account_holder_city', 'account_holder_country'],
	requiredEuropeanBankOrganizationFields: ['account_iban', 'account_bic'],
	requiredNotEuropeanBankOrganizationFields: ['account_bic', 'account_number', 'account_bank_name', 'account_bank_address',
										  'account_bank_postal_code', 'account_bank_city', 'account_bank_country'],

	requiredBankOrganizationFields: [],

    init: function () {
		this._super();

		this.validatedFieldsProperty('validOrganization', this.get('requiredOrganizationFields'));
//		this.validatedFieldsProperty('validBankOrganization', this.get('requiredBaseBankOrganizationFields'));

		this.missingFieldsProperty('missingFieldsOrganization', this.get('requiredOrganizationFields'));
//		this.missingFieldsProperty('missingFieldsBankOrganization', this.get('requiredBaseBankOrganizationFields'));
    },

	validateEuropeanBank: function() {
		this.requiredBankOrganizationFields = this.get('requiredBaseBankOrganizationFields').
														concat(this.get('requiredEuropeanBankOrganizationFields'));
		this.validatedFieldsProperty('validBankOrganization', this.requiredBankOrganizationFields);
		this.missingFieldsProperty('missingFieldsBankOrganization', this.requiredBankOrganizationFields);
	},

	validateNotEuropeanBank: function() {
		this.requiredBankOrganizationFields = this.get('requiredBaseBankOrganizationFields').
														concat(this.get('requiredNotEuropeanBankOrganizationFields'));

		this.validatedFieldsProperty('validBankOrganization', this.requiredBankOrganizationFields);
		this.missingFieldsProperty('missingFieldsBankOrganization', this.requiredBankOrganizationFields);
	},


    save: function () {
        this.one('becameInvalid', function(record) {
            // Ember-data currently has no clear way of dealing with the state
            // loaded.created.invalid on server side validation, so we transition
            // to the uncommitted state to allow resubmission
            if (record.get('isNew')) {
                record.transitionTo('loaded.created.uncommitted');
            } else {
                record.transitionTo('loaded.updated.uncommitted');
            }
        });

        this._super();
    },

    name: DS.attr('string'),
    nameOrDefault: function () {
        return this.get('name') || '-- No Name --';
    }.property('name'),

    description: DS.attr('string', {defaultValue: ""}),
    current_name: DS.attr('string'),
    projects: DS.hasMany('App.MyProject'),

    // Address
    address_line1: DS.attr('string', {defaultValue: ""}),
    address_line2: DS.attr('string', {defaultValue: ""}),
    city: DS.attr('string', {defaultValue: ""}),
    state: DS.attr('string', {defaultValue: ""}),
    country: DS.belongsTo('App.Country'),
    postal_code: DS.attr('string', {defaultValue: ""}),
    phone_number: DS.attr('string', {defaultValue: ""}),

    // Internet
    website: DS.attr('string', {defaultValue: ""}),
    email: DS.attr('string', {defaultValue: ""}),
    facebook: DS.attr('string', {defaultValue: ""}),
    twitter: DS.attr('string', {defaultValue: ""}),
    skype: DS.attr('string', {defaultValue: ""}),

    validProfile: function(){
        if (this.get('name') &&  this.get('description') && this.get('email') &&
              this.get('address_line1') && this.get('city') && this.get('country')
            ){
            return true;
        }
        return false;
    }.property('name', 'description', 'email', 'address_line1', 'city', 'country'),


    // Legal
    legalStatus: DS.attr('string', {defaultValue: ""}),
    documents: DS.hasMany('App.MyOrganizationDocument'),

    validLegalStatus: function(){
        if (this.get('legalStatus') &&  this.get('documents.length') > 0){
            return true;
        }
        return false;
    }.property('legalStatus', 'documents.length'),

	//Account holder
	account_holder_name: DS.attr('string', {defaultValue: ""}),
	account_holder_address: DS.attr('string', {defaultValue: ""}),
	account_holder_postal_code: DS.attr('string', {defaultValue: ""}),
	account_holder_city: DS.attr('string', {defaultValue: ""}),
	account_holder_country: DS.belongsTo('App.Country'),

	//Bank details
	account_iban: DS.attr('string', {defaultValue: ""}),
	account_bic: DS.attr('string', {defaultValue: ""}),
	account_number: DS.attr('string', {defaultValue: ""}),
	account_bank_name: DS.attr('string', {defaultValue: ""}),
	account_bank_address: DS.attr('string', {defaultValue: ""}),
	account_bank_postal_code: DS.attr('string', {defaultValue: ""}),
	account_bank_city: DS.attr('string', {defaultValue: ""}),
	account_bank_country: DS.belongsTo('App.Country'),

    validBank: function(){
		debugger
        if (this.get('account_holder_name') && this.get('account_holder_address') && this.get('account_holder_postal_code')
			&& this.get('account_holder_city') && this.get('account_holder_country')
			&& // here the condition if in europe or not
			((this.get('account_iban') && this.get('account_bic')) || this.get('account_bic') && this.get('account_number')
			&& this.get('account_bank_name') && this.get('account_bank_address') && this.get('account_bank_postal_code')
			&& this.get('account_bank_city') && this.get('account_bank_country'))){
            return true;
        }
        return false;
    }.property('account_holder_name', 'account_holder_address', 'account_holder_postal_code','account_holder_city',
			   'account_holder_country', 'account_iban', 'account_bic', 'account_number',
			   'account_bank_name', 'account_bank_address', 'account_bank_postal_code', 'account_bank_city',
			   'account_bank_country')

});


