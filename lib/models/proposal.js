/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , log = require('debug')('proposal:model');

/*
 * Proposal Schema
 */

var ProposalSchema = new Schema({
    title: {type: String, required: true, min: 8, max: 256 }
  , essay: { type: String, min: 512, max: 2048 }
  , tag: { type: ObjectId, ref: 'Tag' }
  , author: { type: ObjectId, required: true, ref: 'Citizen' }
  , links: [{ type: String }]
  , participants: [{type: ObjectId, ref: 'Citizen' }]
  , vote: {
      census: [{ type: ObjectId, ref: 'Citizen' }]
    , positive: [{ type: ObjectId, ref: 'Citizen' }]
    , negative: [{ type: ObjectId, ref: 'Citizen' }]
  }
  , createdAt: { type: Date, default: Date.now }
});

ProposalSchema.index({ createdAt: -1 });

/**
 * Get reduced `abstract` from `proposal.essay`,
 * up to 150 chars with `[...]` concatenated
 *
 * @return {String}
 * @api public
 */

ProposalSchema.virtual('abstract').get(function() {
  var abstract = this.essay.substr(0, 150)
    , endOfSentence = abstract.indexOf('.');

  // if(~endOfSentence < abstract.length) abstract = abstract.substr(0, endOfSentence);

  return abstract.concat('[...]');
});

/**
 * Gets `comments` from `Comment` Model
 * where comment references this context and item
 *
 * @param {Function} cb callback for query
 * @api public
 */
ProposalSchema.methods.loadComments = function(cb) {
  return this.model('Comment')
    .find({context: 'proposal', reference: this._id}, null, {sort: {createdAt: -1}})
    .populate('author')
    .exec(cb);
};

/**
 * Expose Mongoose model loaded
 */
module.exports = mongoose.model('Proposal', ProposalSchema);