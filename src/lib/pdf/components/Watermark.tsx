import { View, Image } from "@react-pdf/renderer";
import { pdfStyles } from "../theme";
import { LOGO_BASE64, LOGO_ASPECT_RATIO } from "../assets/logo";

/**
 * Watermark logo transparan di tengah halaman, sedikit dirotasi.
 * `fixed` membuatnya otomatis muncul di setiap halaman fisik — termasuk
 * saat konten (misal Detailed Checklist / Evidence Appendix) meluber ke
 * lebih dari satu halaman PDF.
 */
export function Watermark() {
  const width = 380;
  const height = width / LOGO_ASPECT_RATIO;

  return (
    <View style={pdfStyles.watermark} fixed>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        src={LOGO_BASE64}
        style={{
          width,
          height,
          opacity: 0.07,
          transform: "rotate(-22deg)",
        }}
      />
    </View>
  );
}
