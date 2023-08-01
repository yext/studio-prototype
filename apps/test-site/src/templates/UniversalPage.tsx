import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Container from "../components/Container";
import Cta from "../components/Cta";
import FixedText from "../components/FixedText";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["services", "slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return document.slug;
};

export default function UniversalPage({ document }: TemplateProps) {
  return (
    <>
      <Cta label="[LABEL]" link="[URL]" linkType="[LINK TYPE]" />
      <FixedText />
      {document.services.map((item, index) => (
        <Banner title={`dogs`} key={index} />
      ))}
      <Container>
        <Button />
      </Container>
      <Banner
        obj={{
          nestedString: ``,
          nestedObj: { nestedNum: 2, nestedColor: "#FFFFFF" },
          nestedBool: false,
        }}
        title=""
        bgColor="#FFFFFF"
        bool={false}
        num={0}
        intervals={[
          {
            start: "01:00",
            end: `some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... some fake text.... `,
          },
        ]}
      />
    </>
  );
}
