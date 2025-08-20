import { Formik } from "formik";
import * as Yup from "yup";
import { useContext, useEffect, useRef, useState } from "react";
import * as geojson from "geojson";
import * as gjv from "geojson-validation";

import { Alert, Button, Label, Textarea } from "flowbite-react";
import { mapContext } from "../Map";

export const TabImport = ({
  featuresLayerGroup,
  changeCount,
}: {
  featuresLayerGroup: L.GeoJSON | undefined;
  changeCount: number;
}): JSX.Element => {
  const [update, setUpdate] = useState(0);
  const [content, setContent] = useState("");

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const { setZoneData } = useContext(mapContext);

  const [alertIsOpen, setAlertIsOpen] = useState<boolean>(false);
  const [alertContent, setAlertContent] = useState<string | JSX.Element>("");

  const err = (err: string) => {
    setAlertContent(
      <>
        <h3 className="mt-1">Import failed: </h3>
        <div className="ml-1 pr-2">{err}</div>
      </>
    );
    setAlertIsOpen(true);
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={{ content }}
        validationSchema={Yup.object({
          content: Yup.string().required(),
        })}
        onSubmit={(values, { setSubmitting }) => {
          //console.log("ImportForm: onSubmit", values.content);
          let data = {};
          try {
            data = JSON.parse(values.content);

            const valid = gjv.isFeatureCollection(data);

            if (valid) {
              setZoneData &&
                setZoneData(data as geojson.FeatureCollection<any>);
            } else err("The field doesn't contain valid GeoJSON data");
          } catch (e: any) {
            err(e.message);
          }

          setUpdate(update + 1);
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
        }) => {
          featuresLayerGroup?.on("change", () => {
            //console.log("ImportForm: featuresLayerGroup change");
          });

          useEffect(() => {
            {
              /* run setFieldValue here */
              if (featuresLayerGroup) {
                console.log("ImportForm: useEffect");
                setContent(
                  JSON.stringify(featuresLayerGroup.toGeoJSON(), null, 2)
                );
              }

              if (contentRef && contentRef.current) {
                contentRef.current.focus();
              }
            }
          }, [changeCount]);

          return (
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
              className="flex max-w-md flex-col gap-4"
            >
              <div>
                <div className="mb-4 block">
                  <Label htmlFor="name" value="Data to import (JSON format)" />
                </div>
                <Textarea
                  style={{ width: "400px", height: "500px" }}
                  ref={contentRef}
                  id="content"
                  placeholder="Zones data"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus={true}
                  value={values.content}
                />
              </div>
              <div className="mb-2 block">
                {errors.content && touched.content && errors.content}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                Import
              </Button>
            </form>
          );
        }}
      </Formik>

      {alertIsOpen && (
        <Alert
          color="dark"
          rounded={true}
          onDismiss={() => {
            setAlertIsOpen(false);
          }}
        >
          <span>{alertContent}</span>
        </Alert>
      )}
    </>
  );
};
