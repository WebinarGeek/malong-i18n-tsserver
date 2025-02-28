export const translationQuery = `
(jsx_self_closing_element
  name: (identifier) @component.name (#any-of? @component.name "Text" "MarkupText")
  attribute: (jsx_attribute
    (property_identifier) @prop.id (#eq? @prop.id "id" )
    (string
      (string_fragment) @translationKey.name) @translationKey))

(call_expression
  function: (identifier) @function (#eq? @function "useText")
  arguments: (arguments
    (object
      (pair
        key: (property_identifier)
        value: (string (string_fragment) @translationKey.name) @translationKey
      )
    )
  )
)

(call_expression
  function: (identifier) @function (#eq? @function "translate")
  arguments: (arguments [ 
    (string (string_fragment) @translationKey.name) @translationKey
    (object
      (pair
        key: (property_identifier) @translationKey.id (#eq? @translationKey.id "id")
        value: (string (string_fragment) @translationKey.name) @translationKey
      )
    )]
  )
)
`;
