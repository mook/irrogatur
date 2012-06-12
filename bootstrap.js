/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource:///modules/imXPCOMUtils.jsm");
Cu.import("resource:///modules/ircHandlers.jsm");
Cu.import("resource:///modules/Services.jsm");

const Bootstrap = {
  name: "irrogatur: IRC Nick",
  // Slightly above the default priority so we run before the main IRC handler.
  priority: ircHandlers.DEFAULT_PRIORITY + 10,

  isEnabled: function() true,

  commands: {
    "001": function(aMessage) {
      // At the 001 response we've successfully connected to the server.

      let account = this;
      if (account.imAccount)
        account = account.imAccount;

      let newNick = Bootstrap.getPref(account, "nick");
      if (newNick)
        this.sendMessage("NICK", [newNick]);

      if (account.password) {
        // Send an IDENTIFY command to NickServ
        this.sendMessage("PRIVMSG", ["NickServ", "IDENTIFY " + account.password]);
      }

      // Return false so the default handler still runs.
      return false;
    }
  },

  getPref: function getPref(aAccount, aName) {
    if (aAccount.imAccount)
      aAccount = aAccount.imAccount;
    let fullName = "messenger.account." + aAccount.id + "." + aName;
    let type = Services.prefs.getPrefType(fullName);
    if (type == Services.prefs.PREF_STRING)
      return Services.prefs.getCharPref(fullName);
    if (type == Services.prefs.PREF_INT)
      return Services.prefs.getIntPref(fullName);
    if (type == Services.prefs.PREF_BOOL)
      return Services.prefs.getBoolPref(fullName);
    return undefined;
  },

  setPref: function setPref(aAccount, aName, aValue) {
    if (aAccount.imAccount)
      aAccount = aAccount.imAccount;
    let fullName = "messenger.account." + aAccount.id + "." + aName;
    if (typeof(aValue) == "number")
      Services.prefs.setIntPef(fullName, aValue);
    else if (typeof(aValue) == "boolean")
      Services.prefs.setBoolPref(fullName, aValue);
    else
      Services.prefs.setCharPref(fullName, aValue);
  },
};

function startup(aData, aReason) {
  ircHandlers.registerHandler(Bootstrap);
}
function shutdown(aData, aReason) {
  ircHandlers.unregisterHandler(Bootstrap);
}

// Shut up warnings.
function install(aData, aReason) {}
function uninstall(aData, aReason) {}
