// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, MessageFactory } = require('botbuilder');

const LANGUAGE_PREFERENCE = 'language_preference';
const ENGLISH_LANGUAGE = 'en';
const SPANISH_LANGUAGE = 'es';
const DEFAULT_LANGUAGE = ENGLISH_LANGUAGE;

/**
 * A simple bot that captures user preferred language and uses state to configure
 * user's language preference so that middleware translates accordingly when needed. 
 */
class MultilingualBot {

    /**
     * Creates a Multilingual bot
     * @param {StatePropertyAccessor } languagePreferenceProperty Accessor for language preference property in the user state.
     */
    constructor (languagePreferenceProperty) {

        this.languagePreferenceProperty = languagePreferenceProperty;
    }

    /**
     * Every conversation turn for our MultilingualBot will call this method.
     * There are no dialogs used, since it's "single turn" processing, meaning a single request and
     * response, with no stateful conversation.
     * @param {Object} turnContext on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const text = turnContext.activity.text;

            // Get the user language preference if specified.
            const userLanguage = await this.languagePreferenceProperty.get(turnContext, DEFAULT_LANGUAGE);

            const shouldTranslate = userLanguage != DEFAULT_LANGUAGE;

            if (isLanguageChangeRequested(text)) {
                // If the user requested a language change through the suggested actions with values "es" or "en",
                // simply change the user's language preference in the user state.
                // The translation middleware will catch this setting and translate both ways to the user's
                // selected language.
                // If Spanish was selected by the user, the reply below will actually be shown in spanish to the user.
                await this.languagePreferenceProperty.set(turnContext, text);
                var reply = await turnContext.sendActivity(`Your current language code is: ${text}`);

                // Save the user profile updates into the user state.
                //await _accessors.UserState.SaveChangesAsync(turnContext, false, cancellationToken);
            }
            else {
                // Show the user the possible options for language. If the user chooses a different language
                // than the default, then the translation middleware will pick it up from the user state and
                // translate messages both ways, i.e. user to bot and bot to user.
                // Create an array with the supported languages
                var reply = MessageFactory.suggestedActions([SPANISH_LANGUAGE, ENGLISH_LANGUAGE], `Choose your language:`);
                await turnContext.sendActivity(reply);
            }
        }
    }
}

function isLanguageChangeRequested(utterance) {
    if(!utterance) {
        return false;
    }
    return utterance == SPANISH_LANGUAGE || utterance == ENGLISH_LANGUAGE;
}

module.exports = MultilingualBot;