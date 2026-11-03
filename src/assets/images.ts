import heroImage from './images/hero_senta_luxury_1793742298568.jpg';
import eclatDorImage from './images/perfume_eclat_dor_1793742299864.jpg';
import oudRoyalImage from './images/perfume_oud_royal_1793742301993.jpg';
import roseVeloursImage from './images/perfume_rose_velours_1793742303084.jpg';
import nuitAmbreeImage from './images/perfume_nuit_ambree_1793742302871.jpg';
import citrusEleganceImage from './images/perfume_citrus_elegance_1793742304791.jpg';
import santalMystiqueImage from './images/perfume_santal_mystique_1793742305628.jpg';
import fleurDeSoieImage from './images/perfume_fleur_de_soie_1793742306098.jpg';
import azurIntenseImage from './images/perfume_azur_intense_1793742307243.jpg';
import vanilleNoireImage from './images/perfume_vanille_noire_1793742307698.jpg';
import muscBlancImage from './images/perfume_musc_blanc_1793742307870.jpg';

export {
  heroImage,
  eclatDorImage,
  oudRoyalImage,
  roseVeloursImage,
  nuitAmbreeImage,
  citrusEleganceImage,
  santalMystiqueImage,
  fleurDeSoieImage,
  azurIntenseImage,
  vanilleNoireImage,
  muscBlancImage,
};

// Map by product ID and by original filename for 100% reliable resolution
export const PRODUCT_IMAGES: Record<string, string> = {
  'prod-01': eclatDorImage,
  'prod-02': oudRoyalImage,
  'prod-03': roseVeloursImage,
  'prod-04': nuitAmbreeImage,
  'prod-05': citrusEleganceImage,
  'prod-06': santalMystiqueImage,
  'prod-07': fleurDeSoieImage,
  'prod-08': azurIntenseImage,
  'prod-09': vanilleNoireImage,
  'prod-10': muscBlancImage,
  // Match by filename keywords
  'perfume_eclat_dor': eclatDorImage,
  'perfume_oud_royal': oudRoyalImage,
  'perfume_rose_velours': roseVeloursImage,
  'perfume_nuit_ambree': nuitAmbreeImage,
  'perfume_citrus_elegance': citrusEleganceImage,
  'perfume_santal_mystique': santalMystiqueImage,
  'perfume_fleur_de_soie': fleurDeSoieImage,
  'perfume_azur_intense': azurIntenseImage,
  'perfume_vanille_noire': vanilleNoireImage,
  'perfume_musc_blanc': muscBlancImage,
  'hero_senta_luxury': heroImage,
};

/**
 * Resolves any product image to a Vite-bundled asset URL with fallback.
 */
export function resolveProductImage(imagePath?: string, productId?: string): string {
  if (productId && PRODUCT_IMAGES[productId]) {
    return PRODUCT_IMAGES[productId];
  }

  if (!imagePath) {
    return eclatDorImage;
  }

  // If already an imported asset or data URL or absolute URL
  if (imagePath.startsWith('data:') || imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
    return imagePath;
  }

  // Check matching filename in registry
  for (const [key, assetUrl] of Object.entries(PRODUCT_IMAGES)) {
    if (imagePath.includes(key)) {
      return assetUrl;
    }
  }

  return imagePath;
}
