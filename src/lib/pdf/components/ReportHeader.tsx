import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "../theme";
import { COMPANY_INFO } from "@/config/company";

export function ReportHeader({ title }: { title: string }) {
  return (
    <View style={pdfStyles.headerRow} fixed>
      <View>
        <Text style={pdfStyles.companyName}>{COMPANY_INFO.name}</Text>
        <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.address}</Text>
        <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.email}</Text>
        <Text style={pdfStyles.companyDetail}>{COMPANY_INFO.website}</Text>
      </View>
      <Text style={pdfStyles.reportTitle}>{title}</Text>
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
