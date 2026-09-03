import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "../theme";
import { COMPANY_INFO } from "@/config/company";
import { LOGO_BASE64, LOGO_ASPECT_RATIO } from "../assets/logo";

export function ReportHeader({ title }: { title: string }) {
  const logoWidth = 130;
  const logoHeight = logoWidth / LOGO_ASPECT_RATIO;

  return (
    <View style={pdfStyles.headerRow} fixed>
      <View>
        <Text style={pdfStyles.companyName}>{COMPANY_INFO.name}</Text>
        <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.address}</Text>
        <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.email}</Text>
        {COMPANY_INFO.phone && (
          <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.phone}</Text>
        )}
        {COMPANY_INFO.website && (
          <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.website}</Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_BASE64} style={{ width: logoWidth, height: logoHeight }} />
        <Text style={pdfStyles.reportTitle}>{title}</Text>
      </View>
    </View>
  );
}

export function ReportFooter({ inspectionNumber }: { inspectionNumber: string }) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text>
        {COMPANY_INFO.name} — {inspectionNumber}
      </Text>
      <Text
        render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
      />
    </View>
  );
}
