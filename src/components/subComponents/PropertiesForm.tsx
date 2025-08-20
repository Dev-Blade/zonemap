import { Formik } from "formik";
import * as Yup from "yup";
import { useContext, useEffect, useRef, useState } from "react";
import { mapContext } from "../Map";

import { Button, Label, TextInput } from "flowbite-react";
import { saveZones } from "../../helpers/Storage";
import {
  getFeatureProperty,
  setFeatureProperty,
  updateTooltip,
} from "../../helpers/Features";

export const PropertiesForm = (): JSX.Element => {
  const { featuresLayerGroup, selectedLayer, changeCount, setChangeCount } =
    useContext(mapContext);
  const [update, setUpdate] = useState(0);

  const nameRef = useRef<HTMLInputElement>(null);

  let name = "";
  if (selectedLayer) name = getFeatureProperty(selectedLayer, "name");

  useEffect(() => {
    if (nameRef && nameRef.current) {
      nameRef.current.focus();
      // setTimeout(() => {
      //   if (nameRef && nameRef.current) {
      //     nameRef.current.select();
      //   }
      // }, 100);
    }
  }, [name]);

  const patternForName = new RegExp(/^[a-zA-Z0-9_\-.]+$/);

  return selectedLayer ? (
    <>
      <h3>Edit Zone '{getFeatureProperty(selectedLayer, "name")}'</h3>

      <Formik
        enableReinitialize={true}
        initialValues={{ name }}
        validationSchema={Yup.object({
          name: Yup.string()
            .required()
            .matches(
              patternForName,
              "This field cannot contain white space and special character"
            ),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setFeatureProperty(selectedLayer, "name", values.name);
          updateTooltip(selectedLayer);
          saveZones(featuresLayerGroup);
          setUpdate(update + 1);
          setChangeCount(changeCount + 1);
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          /* and other goodies */
        }) => (
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="flex max-w-md flex-col gap-2"
          >
            <div>
              <div className="mb-4 block">
                <Label htmlFor="name" value="Enter name (a-z 0-9 - . _ only)" />
              </div>
              <TextInput
                ref={nameRef}
                id="name"
                placeholder="Enter name"
                required
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus={true}
                value={values.name}
                onKeyDown={(e) => {
                  if (new RegExp(patternForName).test(e.key)) {
                  } else e.preventDefault();
                }}
              />
            </div>
            <div className="mb-2 block">
              {errors.name && touched.name && errors.name}
            </div>
            <Button
              type="submit"
              disabled={errors.name !== undefined || isSubmitting}
            >
              Save
            </Button>
            <div className="mb-2 block"></div>
          </form>
        )}
      </Formik>
    </>
  ) : (
    <p>
      <span className="font-medium">Select zone to edit</span>
    </p>
  );
};
