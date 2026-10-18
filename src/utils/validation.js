import * as yup from "yup";

export const itemValidationSchema = (categoryList = []) => yup.object().shape({
  sku: yup
    .string()
    .trim()
    .required("SKU is required")
    .matches(
      /^[A-Za-z0-9-]+$/,
      "SKU can only contain letters, numbers, and dashes"
    ),
  name: yup.string().trim().required("Item name is required"),
  size: yup.string().trim().required("Item size is required"),
  department: yup.string().required("Department is required"),
  pack: yup.string().trim().nullable().notRequired(),
  category: yup.string().required("Category is required"),
  subCategory: yup
    .string()
    .nullable()
    .when("category", (categoryValue, schema) => {
      if (!categoryValue) {
        return schema.nullable().notRequired();
      }
      const categoryId = Number(categoryValue);
      // Check if the selected category has any subcategories
      const hasSubcategories = categoryList.some(
        (cat) => Number(cat.parent_id) === categoryId
      );
      if (hasSubcategories) {
        return schema.required("Sub Category is required");
      }
      return schema.nullable().notRequired();
    }),
  scanData: yup.string().required("Scan Data type is required"),
  itemBrand: yup.string().required("Select Item Brand"),
  itemType: yup
    .string()
    .oneOf(["PIECE", "PACK"], "Invalid item type")
    .required("Item type is required"),
  age: yup.boolean(),
  description: yup.string().nullable(),
  openPrice: yup.boolean(),
  openQuantity: yup.boolean(),
  buyAsCase: yup.boolean(),
  unitCost: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Unit cost must be a number")
    .min(0, "Unit cost cannot be negative")
    .nullable()
    .default(0),
  margin: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Margin must be a valid number")
    .min(0, "Margin cannot be negative")
    .nullable(),
  unitInCase: yup
    .number()
    .typeError("Unit in case must be a valid number")
    .min(0, "Unit in case cannot be negative")
    .nullable()
    .default(0),
  maxLevel: yup
    .number()
    .typeError("Max level must be a valid number")
    .min(0, "Max level cannot be negative")
    .nullable()
    .default(0),
  buyDown: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Buy down must be a valid number")
    .min(0, "Buy down cannot be negative")
    .nullable(),
  markup: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Markup must be a valid number")
    .min(0, "Markup cannot be negative")
    .nullable(),
  caseCost: yup
    .number()
    .typeError("Case cost must be a valid number")
    .min(0, "Case cost cannot be negative")
    .nullable()
    .default(0),
  // .when("buyAsCase", {
  //   is: true,
  //   then: (schema) =>
  //     schema.required("Case cost is required when Buy as Case is enabled"),
  //   otherwise: (schema) => schema.nullable().default(0),
  // }),
  warnQty: yup
    .number()
    .typeError("Warn quantity must be a number")
    .min(0, "Warn quantity cannot be negative")
    .nullable()
    .default(0),
  retailPrice: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Retail price must be a valid number")
    .nullable()
    .default(0)
    .min(0, "Retail price cannot be negative"),
  // .required("Retail price is required"),
  qtyOnHand: yup
    .number()
    .typeError("Quantity on hand must be a number")
    .min(0, "Quantity on hand cannot be negative")
    .nullable(),
  salePrice: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === "" ? null : value))
    .typeError("Sale price must be a valid number")
    .min(0, "Sale price cannot be negative")
    .nullable(),
  // .when("retailPrice", (retailPrice, schema) => {
  //   if (retailPrice) {
  //     return schema.max(retailPrice, "Sale price cannot exceed retail price");
  //   }
  //   return schema;
  // }),
  reOrderQty: yup
    .number()
    .typeError("Re-order quantity must be a number")
    .min(0, "Re-order quantity cannot be negative")
    .nullable()
    .default(0),
  // Boolean switches
  deliPLU: yup.boolean(),
  nonRevenue: yup.boolean(),
  ebt: yup.boolean(),
  nonDiscountable: yup.boolean(),
  isNegative: yup.boolean(),
  nonTaxable: yup.boolean(),
  // Carton and Pack stock quantities
  carton_stock: yup
    .number()
    .typeError("Carton stock must be a number")
    .min(0, "Carton stock cannot be negative")
    .nullable()
    .default(0),
  pack_stock: yup
    .number()
    .typeError("Pack stock must be a number")
    .min(0, "Pack stock cannot be negative")
    .nullable()
    .default(0),
  variants: yup.array().of(
    yup.object().shape({
      id: yup
        .mixed()
        .nullable()
        .notRequired()
        .transform((value, originalValue) => {
          // If value is undefined, null, or empty string, return null
          if (value === undefined || value === null || value === "") {
            return null;
          }
          // If it's already a number, return it
          if (typeof value === "number" && !isNaN(value)) {
            return value;
          }
          // If it's a string that can be converted to a number, convert it
          if (typeof value === "string") {
            const num = Number(value);
            if (!isNaN(num) && isFinite(num)) {
              return num;
            }
            // If it's a UUID or other string, return null (new variant)
            return null;
          }
          // For any other type, return null
          return null;
        })
        .test("is-valid-id", "ID must be a number or null", (value) => {
          return value === null || value === undefined || (typeof value === "number" && !isNaN(value));
        }),
      name: yup.string().nullable().notRequired(),
      sku: yup.string().nullable().notRequired(),
      upc: yup.string().nullable().notRequired(),
      size: yup.string().nullable().notRequired(),
      pack: yup.string().nullable().notRequired(),
      scan_type: yup.string().nullable().notRequired(),
      quantity: yup.number().nullable().notRequired(),
      qty: yup.string().nullable().notRequired(),
      price: yup.string().nullable().notRequired(),
      retail_price: yup.number().nullable().notRequired(),
      sale_price: yup.number().nullable().notRequired(),
      unit_cost: yup.number().nullable().notRequired(),
      total_quantity: yup.number().nullable().notRequired(),
    })
  ).nullable().notRequired(),
});