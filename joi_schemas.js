const BaseJoi = require('joi');
const categories=['Garbage Dump','Pits','Traffic Lights','Others'];
const sanitizeHtml = require('sanitize-html');

const extension = (joi) =>({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!!'
    },
    rules: {
        espaceHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

const complaintSchema = Joi.object({
    title : Joi.string().required().espaceHTML(),
    // image : Joi.string().required(),
    category : Joi.string().valid(...Object.values(categories)).required(),
    description : Joi.string().required().espaceHTML(),
    location : Joi.string().required().espaceHTML(),
    deleteImages : Joi.array()
})

module.exports.complaintSchema = complaintSchema;

const reviewSchema = Joi.object({
    body : Joi.string().required().espaceHTML(),
    rating : Joi.number().required().integer().min(1).max(5)
})

module.exports.reviewSchema = reviewSchema;


