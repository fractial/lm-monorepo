"use client"

import * as v from "valibot"

export const addressFormSchema = v.object({
  street: v.pipe(
    v.string(),
    v.nonEmpty("Please enter a street name."),
    v.maxLength(128, "The street name is too long.")
  ),
  city: v.pipe(
    v.string(),
    v.nonEmpty("Please enter a city name."),
    v.maxLength(128, "The city name is too long.")
  ),
  zip: v.pipe(
    v.string(),
    v.nonEmpty("Please enter a zip code."),
    v.maxLength(128, "The zip code is too long.")
  ),
  country: v.pipe(
    v.string(),
    v.nonEmpty("Please enter a country name."),
    v.maxLength(128, "The country name is too long.")
  ),
})