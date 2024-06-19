import vine from "@vinejs/vine";

 const creator_vaidation = vine.object({
    username:vine.string(),
    email:vine.string().email(),
    password:vine.string().minLength(6).maxLength(10),
    country_code:vine.number().positive().withoutDecimals(),
    contact_number:vine.string(),
    state:vine.string()
})

export default creator_vaidation
