/// <reference types="cypress" />

describe('Page load', () => {
  const songTitleSelector = '#song-title input';
  const boxTypeSelector = '#music-box-type option[selected]';
  const tempoFieldSelector = '#tempo-field input';

  it('should load a v0 song successfully', () => {
    cy.visit('/#0XQAAAAKdAgAAAAAAAABBKEgtkQlVJTiq1tcOsPRQF0CuxUONW_IXrtuN3_6hXS5OrWKHykxSMT77m9df3CyO_QqR7BtAbqxVdEMJl55atO5AyUwX4Ff_T1iqciWBeFqORzUyxrL3X6ijpUhOZk7j8GstyawZM_UI_fEadmCVirvoMF2eXVoKjoavFfwKuMbB1HP5RFiqX-Mp_5qYPpu2Sh0fWMP2PmTsvMiEklVPjnME9zZEw_o07W30gwmfj5qP1Oso_FWJrGSTyTx6UYIbrAd59JfqZuQAP5mMjOtNlZBTCCZ4o2oz5fiJ8iB7mxxxND824Umx-3DMoTTM2FvTj_ZUnbfWzDoXICFyLTV9V0uoxTumQ7PxrhQidt8leuSiGUf0EtrCCYMz8LtlTdSy6SmtmpoRmKLLsedgZLV0PqBY4VMwfijUGsDaMtF2bP96AwmIWyMFmFsQn8bpvDc6Ak2_lrrPJswEIVB49lA3EEgUcydwXgsbiuji5YC1SkHMh7ha8vgjkcKigWe5hirGmkxNfBVcK0i1f8fLnIDe62SR04Iy4f-1aLDkQexA9nfvotLNS3rcwiXa6o7s3uqXZSIxdnxwEH0vi01oM91SwRbtoywTDXVcHcQZA1_aVruiC-Mh0-I9uJL-Y-UAoLV7a53__oF7-Q');

    cy.get(songTitleSelector)
      .should('have.value', 'Pallet Town (Pokemon Red & Blue)');

    cy.get(boxTypeSelector)
      .should('have.value', '15');

    cy.get(tempoFieldSelector)
      .should('have.value', '110');

    cy.get('#note-lines .hole')
      .should('have.length', 199);

    cy.get('#C5 .hole:nth-of-type(2)')
      .should('have.attr', 'style', 'transform: translateY(305px)');
  });

  it('should load a v1 song successfully', () => {
    cy.visit('/#1XQAAAAIGAgAAAAAAAABBqEgtkRm_4Dbv8SM-eZ_MurEomTVGgTcxQKG7dKcYUvxdfJDksSOIUjdiiBvhn2bkWIbuFHLl1nQeEz0t4k6rzuIvFy0_2LyrBHyQE7nswP_H7Favj8IjKW1-OHvEWwu9uLClqrzTcAc3NcGBaYGYK8l1Lbypo9JSEkiPvW7qybOSLvpeZlRxvfhK3-xmCKRaYl0PpmMiNcvnq8rXp_XpuKUwOi5N3KUId0P02xIu4d9BomftlnQctxFlBJBfY4KVV-KSOSmrwT0BjkIQn6RpCbU19k8WRclw6Ja4IUSrOgnDgCO0bTZejm9mIfY3zcUAztL9C9tPTnkUr7STCq-CODJnwlcciioPLoY1cp0jr4BRpOkHOhI4uifKJpeM1a9wkEhaV5Ml-Zk66_-WSirU_wpGqLCpEij3U6IjES4QVRopMVVRERpGfgR3z9llbh9euNV65cNcLQX28KUyqfGK_MgabbATGWK6HtzpxN3D7MNFPdTOSMgtS-Dmc5RZZoH9mTs0GjPxv_g7L6s_ncn_OxwBAA');

    cy.get(songTitleSelector)
      .should('have.value', 'Kakariko Village (Ocarina of Time)');

    cy.get(boxTypeSelector)
      .should('have.value', '20');

    cy.get(tempoFieldSelector)
      .should('have.value', '100');

    cy.get('#note-lines .hole')
      .should('have.length', 140);

    cy.get('#C5 .hole').first()
      .should('have.attr', 'style', 'transform: translateY(64px)');
  });

});
