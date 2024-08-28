import { MBComponent } from './music-box-component.js';
import { renderSongCreator } from './browse-tab__library.js';
import { jumpToTopIfASongWasClicked } from '../common/common-event-handlers.js';

export class BrowseTabFeaturedSongs extends MBComponent {
  constructor(props) {
    super({
      props,
      element: document.getElementById(props.id)
    });

    // Static featured song data
    this.featuredSongs = [
      {
        title: "Merry Go Round of Life",
        data: "1XQAAAAJCAgAAAAAAAABBqEgrYn-0VJkziGSHTrQahCbWjs0dVIYL0kttG0mXfcZ_QSa9wXPQv3UJzz1U5jT15GJEqRIIbirqLXdHuCUbfTe4aybpueQC9iI73wEWuWwxAzltn25v0aC6RVW_EsicgTT4JLuk68RUjBcLBrTCY8AZhKZYL4UzIo5GrM8ZfTJVZbIaquh17CvPnD6YrF8tpjHlQa80sT-1ctlCHg4C8a1UMbJTp1fH-sDRb79BsB12EOe1CNtK39qykAFhWXw6FMAsA0AxVkreuFyK4R2czsLy65-z8RmpB-sCGVoGPd0-4awybp6jHjqtd9aSqiP4mFI1iCxSF29aD_q1nj_r2ujpljrE3CuXgKQhy8QifVank2CCAWjPzw5n6V540qaOvgrbX2DCEwxvZ7nGMf_0CEDpPVuBOAj_x1Q3QWqQZ85Yqu_zPdqvzOcIYKOKGUFqDz5-UF0jsO5CXyxIJ4WYCkWHeZtRDBB-ymTxjk_9Uck1",
        creator: "@hzjxhnxuu",
        creator_url: "https://twitter.com/hzjxhnxuu"
      },
      {
        title: "Super Mario Bros. Theme Song",
        data: "1XQAAAAKMBAAAAAAAAABBqEgrwrL5U6KuOGw3QozkdGiG_-9xICsLHvzWoyDZt-jlHj8ewYignHFCA0uYiE_oTzeQB3t6faTfz0ofJE-4PKRQQNujD6_2PhgUuMwM6w36GNZRe7o7KQ--nxm7TLZRfJIZhWiDUbkOg4UnATFECkYHdUJzLx-y_U9pIePpcK5Mssm4i_3-KuCbMhewfjNIEfNVljWboSBhrwEK-NsBL30rwAliQbZCy4IY9dj-ZltzfkW0akPOVy2QihxHCXPwC39NPlrVxqW_PZmfoCJ2gcUXBJjLDZhtOcqSikOTmuk5iDRiuBNt5PfCjkxg8fY9HQ_th3R5J3uS81Zy3yZrgXWM0y5GvggncCOVFwTULWihgbQIpFZCFHfIjt0pRhhx1HcAzDIfqosCobzxmjiMMAG0kCriKJ1G8DpYg9HA8ygIOi_Zu4eLsHoNEUZcfhqo4djSri-sViVFHfAidKLm2MkS_rFnaFTRINuXlHMTOtijL5vVvp3IB9HBJLzrI-xV39EB1BbxHU7sCYEMJ04ydEDAGe_sK5bf7cKIDAX0IK_PsSvvCQfUMN8rzM3aTsKio4cvOWC7M0LL4Rte2kFLvVZ7roIUUb5MHcf-O0uW48pTViUeZsFcr-IyQ5m_WkkfPMBN8m78bWLYiWHfehEqWDoyMdZreadsN1fRXlTFZ5hOEnDoyNdWxTBSxfMfb0auQWzYcWq98ebh0nPVuHWZmGJYmUjnHC441dyMaC7r_WtwNDHPSNgxSux9Y0RIsN1mupU2u7V0DwNFGuLzAe0FmbEs6Gb60Z1MZSPRLKTTpfdEVq2jA1gfPn7m4fjpiYmbVl_3m3sSyc9zp3tY3ZZ6HaqgVAH0NXd6IPglCGc9tl1qvPbnTnYCdFWBDs96byAEzPxHVHDkz6cSsivFcCRKiSGMks5Gyj7WDbHCyKRvxKJAK8-CseUN-pTcT_8hhPAA",
        creator: "@BryanEBraun",
        creator_url: "https://twitter.com/BryanEBraun"
      },
      {
        title: "Zelda Great Fairy Fountain",
        data: "1XQAAAAL6AQAAAAAAAABBqEgrou4ySt--_JLGWsPrX4KI2lJ4wLSb1mqEjqnV_HxWkIqWF3TZaoYl9axo0JA4Zm6YXKby7TYt3qFP8w7adJqTThevnB9Tt8ZIz682nxneZYcXk0gyt0oR9Q5j2E35UmBjxxg3gDpXnlB5j-9KBjw3ioRT9wrw3wU9MG499qjnJWTeuc8_ovzmW_y5Hfvn16RnxxgmNX71f8AdeGK9jC2x-rm4kO6iXzavxhbk3KXL8JN0lKjb8XaZLElYFixECrpHl-1kKF-7maTaUhBiZzJ7Re0PfQJGvOfyiBc0w8HKMQwVVPXKyaXfiHulUUX9oWw6vp-sMUNoLkYoByH9fAFHthVy9MWJAV-NVPSOUTfxaCSswXlfPlHgx4fNIMPh9XN3h-rgduVhPq7zY-unWPoXCmcoIyamgoPQsTSaIoFGN3ObEfkb-6N7TFkRXeHDawX2Vu828QmNuWBzQzvy2AfX_39yFlw9ylpbHd77nu9zWXyFqH6CAJeUE02qAtW9XvH_EK1AAA",
        creator: "@GrandLineTimes",
        creator_url: "https://twitter.com/GrandLineTimes"
      },
      {
        title: "Wii Sports",
        data: "0XQAAAAKBAQAAAAAAAABBKEgqotTGnIhlXOKVgbcmMvjkf6lxayePO1R2D1MhuFnU6ky7nyBx9KjqA4T88oa5qgidohQUpLO6joTdqVU7cEMxEYUwPuv5C5M3zZCRqSadBRfBbSaEj_UAC232zqwBFabPGuJMzkz4md9nisuDQ2giY6QfFM0-khy_IqnOPlxKYRmqUSEFEkP004Qe4R5eJU2YD6Jowi7ZkhCCgRXzDnVeqs-u3JyS7CkxhRpjRGm4FhT0ytiM8olEZyUatvbjQhunjnPURgWnhhEYYYOvKrVsWzmUqN1c2YT-AEy0MvAlCO_AevfG2cSm7Og79nulzijTh3ud8FdnUbq2pr1FNBijkRp83qVnXJbhmtCuAg9inrQKHrspiwLWBiNWJkoDMy_t_vT4xKw",
        creator: "@StevenBraun0",
        creator_url: "https://twitter.com/StevenBraun0"
      },
      {
        title: "Beauty and the Beast",
        data: "1XQAAAALCAgAAAAAAAABBqEgrQiI27jWfltvMQsZhF8_sedN3eMupFOn3rK28X4CBzW0vhrbhQNWZXqWEKSEn-douO5dVUZzgQloCFG-NOHrQsp9s8y353CnT0YZeB9Fy9u6fjH5M0OVJhaxUY2dP6Z_NzdY18RxynovDWPyEOwE2pFcBbcNvIWDwhx2Vsd3FGRh4wgfcgcxrzXbbfS_dQfvh_9um7WrMmpZxovgFoAtj2vijdSIo12kOABMHaOsotkzrvD0nb9JOZK5sxbk2YaNYM8hTO7330yQfviu46RrBR4aL9WJms_1M4NQBKFe-lTKpqMNPN2wKbaDmztvVyEzis3NMmh4x_SkyojXiGDP3nXjngtvNEo2TMIQksubLGojVrVfKVGXvEqAKGlJN5i5HQ65WWX9QUhgBVPlkuKpSjuSmsZT-lZRQlTzivV0jyaxCymmVWrp7JYRJPrj5ho3hizvm58euPcGXFY_chQQquuYb7Wv-iB3DvdwxVV67n7zY2o7DcfRP_Gz3chM6PXF1WGXFOOHZey1d_opDiSAN8gUE5cYbaqCsr7Zopv0x79k_YniSfBG4kttD_pTqhRdEhX0hQFTzsQ1v3gj6DGwDlsDFW3O7CRPJyx9tw7CdUjJBIayQk655Owey_p0TE0LXXq8TDpsewsAhGtx8VgTILw3wFJwaQUvFywYHvyw1-4guoQ",
        creator: "@DaniR_1624",
        creator_url: "https://twitter.com/DaniR_1624"
      },
      {
        title: "Secrets - One Republic",
        data: "1XQAAAALJCAAAAAAAAABBqEgrYrKzFzzmovpPgfHzS1-2FGtkDDsG7krfhBmv9V_s1qfvSlv2AmVXxuBnTMbh8-BEc6_I2asBipyPWgemUWdbt9OQdexK2Tr-YQ79qthT3lW4v2ExMzlVSTWyGSvPexsxgkhufVjCqwI1ghe1MyGywlWFBFoW-OZz1LuijeMa6h1am7t2Rm6zd5TpRUxZMAekCL_6sIwwf_w1JPE1l2zqSoLrJLcdo32SKvunDSeePWnecOTe92xaVFhh7zeaR3ckKU8sbK1BEGxiL1EyujauEOAiE_2yoCDqqvtEIqZ8MAxrTRb6PPprMh72K8P3WY3FCJb8Zk_g_cBfIBA0Bw6BGar2AhAdo0K-2OpdiBpyqvjLpWmcVQzDb7YUvw8omP9yGYChPsp4BdxSbYxLt4KI4Ly1CWAhxodog2T3iL_Jj9SuW2dsufic6vcugt_ald_cpWWGXh3-WvgNzYD8G_cxbheRrGIF1C6vJTwSKdopKAm-j7-NtVBtQUmOTgm2toqdsgMMPEkStMJgTeVPxuZcftegpuFyX7MA7-ki2Mhr1kVOlhUtz2Rjg_vGg0eWzGAr5GFNx934bbdsq4_Lp8d2r6H2HSss-1i5uq8fJH_oxR56EBosUEj6ftK2ePM8ukuWaT8NXNK24HLGzPqMtzfwKirtxrhFm4mbcXVRCljFhQaJWPfqPNvbJOqEMQ06cyabtwA-z6VO-boERfR3GZHy2rMVVacxfjEuhyNEEqQGH5fYwj2H5WpOdu1hZXSu4qOr2UVOpa8tcvPLph4ouPb12IbkN3_ufGVZ1b48wArHZwaanCL3qDNKbg41SIVVwm-L75mlfGsymSI6rbb-kJ39hhS8GzNHMvtVqLqzAhg85tGbhDkRfLXrv8HtrUwuBSzOMKYlcBKxL0ybAOpEGJ5GMp567gCrtkrFGbJ5-rsnN1U21kBBJ1uyJ5kqeCeFepMJl7tlinf52becR1wW1ZAE47cegA9BsrdTD3vXYCK0XokPGpSPLn3x0Rxs8IqRRbpL_TwkDSMSU2ctvLtWyZatbQBuh5Zz30YkX3kkEHvn9vZMlBDcyD4UCIvT8OfPUpEan4gZ0Qt9xPUqEWleFEDhFlIdgbNkWwrMky-TDP7di8W1g9p19ZgLcPCoDs1mtX56kJAeC0deGbLmgY0rhJ_xYcuMmf67S6nIz7ZqOKNsnZo9azn4S7KTg4zhiNe6DmWlEtHkWRz_5P23oi5fBp1MuCeEJZUPpkFIP_BlNg9FINb-2GSq3MppXVvzwPpjEuwfl_w9fxdMtACFM1cX1y16z0z8PqhZ5Wsb-RWRu0_iNYNNpOOB5x8YhkGYZ46gT-kOeWis_Ii1sOc8RveJJaqzQgxGX3hqL2oZ-nCFtnOycY8lKDG7LzldcSavFLSvrs5n49dwudUxaUC9NwxQ_PtMzgh-Nxp7gOxtqCQGIpFV1p5EQ1Ju090tL18Hqe55w43nUF7cQcgYkSQouN__5b84DA",
        creator: "@DaniR_1624",
        creator_url: "https://twitter.com/DaniR_1624"
      },
      {
        title: "Numa Numa",
        data: "1XQAAAAJUAQAAAAAAAABBqEgqkoh6JmHk8RxRhzkhcYpD_ThHfvM7832M1pqGUb2pHU_ptlpLtEWKPvCxFeVQDfulO8LrQVvyWFMC4wtnZmfneF6GySHOW7Zw1fgP2TyhNLpA-Lnw1vGV0CI4uo-WnWeZowg00D6cid8RcqIKqMGOUQA9q-5gQWRPsVPznyyrNFMHmBa4PbrOX1KXhIFGMZc15u3O7QS2gNlGWM6Omqz3ddxCZVi5qZJTnGDh_I_vIqw4igBpHVtxKUf12UV59FhufjbWDLh4X5gCDIsw-EbqMxSt4CmIq-GypeXU6E5tO-AFCGDPa7-iULrQ-VHNdwyWuUZkaFg1jxKMuWcsfPDBZRL_xy3vrg",
        creator: "@BeamBall007",
        creator_url: "https://twitter.com/BeamBall007"
      },
      {
        title: "Pallet Town (Pokemon Red & Blue)",
        data: "1XQAAAAKgAgAAAAAAAABBqEgtkQlVJTiq1tcOsPRQF0CuxUONW_IXrtuN3_6hXS5OrWKHykxSHWHn2WrGrrLN0-TY0wZuNIImudVWKtsDGg3Tl2JXWQyaAsUGgj-RUBvEmFwwDgrivnhTnMAaDr37Zt4TBT2Mx3gsoM7sp7V1jPxA0xPcK9UtgEUJIbJIBH2iKCHAzcUZbyBg6PZH_uh0f0ts1orzzzUs9N77suQUhlMnesWlVDYHhWJDO_9ExmlmvmN6BDMi-JtA5_QD_wfWF-welAaPE-OcsMFBXdDjYzDBbYjZjfDk2YATZ6_4UT0GYJKLxHkrl70FC0yNbW1QRgXXpaDX_vSS5qs07B6f1n18DDqwtTw1QJ-H3I2-eI7cm8leBAB1nKBLwOkK3wBNo5hPZk-FFexSiFeJkxVQ8f1LhPBdS-FMpuTzJvR7JRNYtQTFxhYHWynmW3PffZvejvIUoiUAGc5LO14iGkTA2a0jrktiCoDGRi-uyTXeo_Q-lUn8FJuOPaVwRMf_wlTZxUfijRsQGV4rq2lcCQMnWQybO-6cB3--zf2bcKHzuzBIPE4CDThq7nQVIjlIlPeake6qhRwFXf18bRTdSFou1HFNNjLwBRhdVdDjHXhRK1hXe8fkRgLU63LJA8HoR8__59eBjQ",
        creator: "@BryanEBraun",
        creator_url: "https://twitter.com/BryanEBraun"
      },
      {
        title: "Never gonna give you up - Rick Astley",
        data: "1XQAAAAJmAQAAAAAAAABBqEgtkTKMrAj_TMtKBdZw6711hgRhxUD6g86mmN2E2R0a_XrNHZS9pMmHYF3e7V0v1ksLbki1r2d48Sq78Wvy3JHgfmxqSnhK9hk2i2WLAg7PUE_ZNEPTyNY6Jb8uQeQN5NL9eR101GxoI4sKFNM2dkTarX7tvNqy1i_wXmBV83DbskgNYtDhXTWRmvNHp2gpCz24nvyt43crOe1miIn4-z5jIgUSbkhvx8UKK3wFmH2cmqSjHiKLvOrd1MCo21R7RpASeYuoxtKv1QMmvwno9VfDic9VR0oNuQiDmeyqadF8-MYRGUOXFkWpQRLaekVnIO1sHlRabnooAx8AIgubdbxfW4iW7FwG_YwqNv_pTQfn",
        creator: "mars",
        creator_url: ""
      },
      {
        title: "Yiruma - River Flows in You",
        data: "1XQAAAAJaAwAAAAAAAABBqEgrsuXEABbqnNYgp7dlREtSCI1nov7O5k_qB8r-7YpGXsAy1MJR0NEulGhAgrk-4JRJW6NY8syLLwYMOW1bu3N2DuiYxmvzki5iMYcH02ZZI-unn4fJPueXFdkn2J4Dm6o0INM_TeKKe8hAQjPNH0n3PDxztcW0EMwR0zUhMHfLCttpzMhr7oGMI8HiHFIpyz3He_024DTL472kRzjIKKRMEHLFKwREp5S-T_zKcLGzQA9gV23P4Spatt02GWjtCqtQ9NEkavinmtwGG0Q8OxLWq7lDFRLAXdPpiJh1VX9pukkvQPuC2xeNQKRVLWn_JAzVNWyt3XVzurBeqti1979G50qxsgfAk1T5w2ZBCnbcoVpeFWxDZ1M2Co4dZlfHEA8FAWkdYY1sdgD_MFJe1NjclojjJKpultoVPDGXw8NTele_O-GDN57MicoS-cgn89Q33Rm0V1RirD9UJUcHgFRaxyWrBDYRXMvAvBchxcBZE80CO2wdh0Jr7mtW4T2JCH-eQ8OWN0qscCHpK9kkh-Xqb62or0eu499gjYuRAwGdI_gwk5vJvvtXSupPz6RPffRUcG_xIv2I_zyd9-CHlb1ZAsTWzzJN5vVW_FLE-cFOro6E9TVWNxsBI5xxsOSx7bNIh1PegmM6xtcX21zBmLbR6JDqOgYEVM8wMvq8fOBFmm7H8mTIrdy4br0g2L1h0K5kXUM7AX_ZdBMIWzgGlrA5aniJhBN04Giw33LdF3-Fi0LdDmxfCZtBn5xlrOHaEaGJPUX_54c5Ug",
        creator: "Some guy",
        creator_url: ""
      },
      {
        title: "Star Wars (Main Theme)",
        data: "1XQAAAAIqAQAAAAAAAABBqEgrYrL00NvLWccEJJXrAaLS33tn-MKwrGkic4vuKSEUjQXkUW6BXzvkUUDmeuftMP-tDPGMeod4eYtxF13CvyDceioz9j76eXDZhhl74zRbJ4nuR3dwvVxzn6HC3rZDYkvS-rmCytnh3DWlxen7g3xpkbKFokBhZS0bkIZx1Wq0Cn-3YPotvOrKhs5_3Cklcs5MbPHAAc2mYmsf81HyvFUlFMxG5miG31g9HhGT6sN9UE6TVkeLpODuk0yfDECFdHUV54cVIeMri7vO1rnm4W3-TAjphJxU_tWfGE7abwWTBN2VJO3Dtw5x6bFviJgB_9QcOQA",
        creator: "Mehdi Mabed",
        creator_url: ""
      },
      {
        title: "Windfall (by the fat rat)",
        data: "1XQAAAALGAQAAAAAAAABBqEgrktTEN0CzDhWnID3sPsCBjmsvVemJWKsiDnf4uIsieY315L9GX_d4AA7KB-YgouaZ9iguP_PGeLnmbVxXIROYY2too0myjAIukAUBnVdP7iUnMDQF31MWKwBNW1ORtHVPESvhrDfpww3CYcES5JllwmCjOAOWEc5PyyvCZ2NGr1H6QR2p0_fnNpCvRokYAbo1x2ckQVdYRxtDQ4FGolKTd0cpPRqM2qq4dVN28HHGwxPCoOQvNdynE7xedqRVGPUcyv3TXV0k1-TUmLEcvvatZacRIwSL-5ZMu_UoS__j7EXTtCT2UCMZv2KpjjqMltRUh-oJYu9ZfKJqbUAyDr_LHxEy2y2I2f_GZSQg",
        creator: "@livin4mydream",
        creator_url: "https://twitter.com/livin4mydream"
      },
      {
        title: "Winnie the Pooh",
        data: "0XQAAAAJxAQAAAAAAAABBKEgq8tTEOIEqx7CFffgTZ4f05uGmcKqsB0GhTPOBAblJUmP_14aH6LGId1wWCvE8fiXcauevFJXE8IUSzQXJ-0jPRknEqsCsbQMtU3c-rIsE3v8qr8ysmnwnAKK2iULPiBQ44GdycjJ5bk2mI0GvtV1QcSxCLmGuZLoWIM3PyoK8Slp3quaTT_iWIH4pXSTk5I1CIgxt8JgBeTB5hvZ2TvRbpUyqaKhZg0o2NjYJW_s0K5LLyVfXmfIYCKlMiwVPm-nFUVG_vHw3eL0JnXBu0vL3YmosqtZEpidpX5XWOLYWFahSx5AI16icGtW3oCSpX8cb-8oDkF3GYBEvrBa3dmBpCRldLpXhEGreLUsUtQAsUtOEsA-g9J9lNtyVagrv5KHGh7LMD6z964FtgWeK__LeXzQ",
        creator: "@BryanEBraun",
        creator_url: "https://twitter.com/BryanEBraun"
      },
      {
        title: "Faded - Alan Walker",
        data: "1XQAAAAK7BQAAAAAAAABBqEgrMkQkbTONluCmpnuwFucpRMMnfA9GBcLpkPMmRo1ptRjdt57aaNpvAJtoy6uUP70ueb6i7qdSJN0pAHygtm_Wih561nAJJES3debwL-EW-UdGb5p9ZFhplT_rT6E12vE9wF_vVhc2Jv85ERRCDobfXuoboSIOgPSwQLG2gF3pA6kncekuMC7TPO9RMEZCvHNpAbOoLA8DWvossvVpspLCm0UatacdDV4b0xKOQZde36xqJR4_MGfNjKhimvZT_xmUW24lh-frEGcYRdSZ8xS7comvgoreeMxXaurRKT-cS2-2c_bnk7IRmVljv6esHs8lCKg5LW4lRzWXu4DRunG2DtgRDTvulnN3ydvXEw_YzIzM9FgxhufTLCtV9ev0z7E9VWzhGP2wPs5eGaVr4S4OqsVA-ObOdCZ4-reP3fFNL9K4rrmnt9FSldHvxf9ZUfBp_sL5uyMvM5Fz4sVy0Sls2TBP_piVKQHxqIDoS9I2PQBuSMwqqpgGpH5l7k8R_BISjwANh7OUbS5p8qf7ciBpmBqEXCmMtHBOauziDg1pt8HksdbpVQU-wh6LRrydEasO4oWDfnuFWtmKjJPor6065EkG7lgwyK6rtvZWHyv0C8amjt5kmF9Tp-aQU5xzS-0BXWSufVkuvFg1M7MyoLFdHsmBK6KkGEVM7P0j5EawzTqt2lpcXtk6yMoaDuGWT9iMPR5QT0l-yE9Cwb8MMDhDq1kwZSIqUigoRs2y0v6iYaMY_xaNfKv_6Z2SrVhj3JYYk15EdCH4wwiMIMMZFleNXrIuQlT5ou_NbZS4oVqRFwt9jHEbKpHAMyfEY1P4tfNbVk8a2m_tDv7cQhrQnKCTuNPsKv4jRX04jE5QZpGfcWSODmlWI3tE2npKNKE02wyzc1FILKfOcuQGNDIVVxjKg4Hp63R0_i94TsXgg--TZjIbaywZ2M_F3Xp2kRxrGhjdfwzDeFUS2iCmJow2xt6KO01WaWUBvvsVq2smREzTpyDhRBAdn5EufgonwDDXOHo_0NWL8wXYzT3ZUOQIytqwtKq99m58WPXcq-xw5aGrhb9hJuSdH3fj74VROYfML4fB5QTgfr9j_4wyolE",
        creator: "Some guy",
        creator_url: ""
      },
      {
        title: "Yoshi's Island",
        data: "1XQAAAAI7AQAAAAAAAABBqEgq4uXeTjeJiVxM55_egTtEgv9c3BXWFU5VUYQA3MORMXcNoWG3oZSfsGxKG4q4S3rAau8HatOIVTfmHtgyY42T26GHdZp0_zlYg8Zvf_smUhKoBmbvd1NNMowzbS8YrbnJtIZEt1s3DJU0iG9L92v44BIUEhCRt1Dbn16_H9WkrmLi8He_kBcz0jQuNdiLw7o3Hx4PImdxCFvSZxrJnNu2dHW1T4YqIcgmD86MnbLdSVOHYucnPXbmsfKxKtGTtgd5v-hO7JAmoA_aiCOu96dH09fcrQydmBSHx9g-k86Q-lhsdNrEtQhrCzAnbinKmQOdVNKu_vjhxh0",
        creator: "@MikeDWilly1",
        creator_url: "https://twitter.com/MikeDWilly1"
      },
      {
        title: "Zelda II: Palace Theme",
        data: "1XQAAAAIZBAAAAAAAAABBqEgrYu4ySt--_JNMduDtxUaiAwl3ue4RT0RoR3UePbTi5FZ3DozGtcXjD6oeYGdAo0fmTH9SDOc82APxmT7wbV7ZLxc2CUgEEaZ4fITGT6IJZavwjXLvfmmtg-lsFYXOKx0swAVEKxmVYGznPr9kEF0easw0rCA2wYEK3QpbfemdqMATuIGxZg3D-ke59frpRb-KE99aoSS-1662nis13HwhVJBv4MaE7ALrxo5An32mJQy9xCRXO4fXpptO0aAiGcHJuThkF4TALduQ7NelqloMJ4ihyWShKjLbo2c9SqG6pZLSscZMhS3km9ETGlaUhftV9QajGSs2i534rBEJIkAA1mpji0QjpB2wbfsEow3v2SYlJdtjk5vuoYTsohYCI3hA86c0lcEQj0G03imtudg26I2GiiwaMhs7uc4LbA0nbymwOo-2bIgxdYTn3WCx2-y0l3_fvuA3dHo8mDPEbrp5knJc0Zf61XDIHHEwVudaQo9Rm6qT974OKRlDTdHwuyWV7xm7n95eSeyiRjrRxgtpYHgipKt_aYWMmWLAo3dWRx5A149LgAX0wSmbavhrqIQ0UcdgYk_-Ll4Wr9nrAttLvkqd17R7Wd8ylD7DHGI3bKbYagnrLjlwqxGOEgAJ_MHSWEH3uFa1ZqmHjDn8lnjfeOUsQLH3zy0wDQHbCOUiKiFq4KoiCrsq6wrul7FmeGy8fSK37H8rmhcmbBXyrNWBssxFoQXnLXLZdyEU2B__i6XlkXISpTd73ACAo7ezHDJc6IQyNrBjh07aaN6b0reZNiK63_fBtGZqB89bO1-NI1cibyBRwfldAv9snxQA",
        creator: "Jordan Good",
        creator_url: ""
      },
      {
        title: "You are my sunshine ",
        data: "1XQAAAAJ8AgAAAAAAAABBqEgrQuXeUkf7QSsGV_8jndrTRna8YDDQfEFLKam0o6xJzU7e8_kzVFddQhcqgenTIY20pNTrnRK7EnMwuW2VToE-mis3UZ4MjK9-w_DXzwSu5zdbLlSImJv3dY4ejzwrTMYOfrUkpWrTuY-dqM45qCp68yZz_BU6A8rRL2PnwnMIVBfSFS0fox2EKo14vHKN74i12WIO3a6FBJ2sEcp9URIhNIJq5JmIKAxx2xR1CbjkYzNen-Iatyv2lRVcdNSteC3Y_eGDBWd6ilQ2cleG_dQX6c2J4esto35Lzf1UWD4dtA426AEt7-1uljUTn2OllAV2DMNCiYcuW8hqNkq2DxbHaQzBXge_cIiYotb_RX8YhhABzvJbxqBVU59akOwJhDw7rp94kvd0h4Um1P0z1Hx7GP8N7yfVvHNaVxhOqbV31JUZaUcJTY08ljESZAZ3z7w0iuNVMWzXOiTUrfCgHPmdWD5K0jPUP_vTJMcZY7ajFlBdAcny0_d9WFT42wcVDkHqZbJo0o8_Zp9p2nnB9SlkwlrRZ7ILpHujv-7uqljqTm_poN0ty8__5hFcww",
        creator: "Jordan Good",
        creator_url: ""
      },
      {
        title: "Davy Jones Theme ",
        data: "1XQAAAAKBAQAAAAAAAABBqEgrAjMlFLJs9vq4KhU27d4a23Tu50n28hOH-MOC1u1gKhD_6Mjx9chuo7vTk7nt2UUbegf99PuaOuob3RqzYrtYW667g-kiZ1r1vhnVgFDqZv-53hzsgEjMntY5oOyal16y7_AVDooYT9SNuau04FJP9r1-_3Pkp2i47l7J5b-SriZ2RoFz_4xzPWxO86i8PkNsXZh2r7z-Jrv3BwPFauB59jYooMDoROkdYIAp5QPLc-yeYkgM17I7elcZcD-HDkkfSElxUBkuGmlpoxkJSa8R_Rm7_a24catHTYKnaiwmJuZVdkuljFcd7fA7rfUaf1sRJ0bzRIYzQgxh-8ZMPUfsXG9ZE331U2ifEjz4W6rMmpkrcg1Buoz-vrWe",
        creator: "NicoFox",
        creator_url: ""
      },
      {
        title: "Fallen down",
        data: "1XQAAAAJNAQAAAAAAAABBqEgqwkQkf_VuyzyCdVgBNvli5HJDNGjKIFSgxLvjbm-ZoJPcKUG8O4heMJo84xBjzNf7tQBKdZ2DkUIrUVx9WdCyJFmOPQIEk7oKhQ1HjJR0pYjSU18xFujcArs4iT9Nol4OKBA7nFZY3bebxm3KaDIRq1AivoodrcHDOcUecPfzAROAlx34KldD1v22wdmtopBAeuDw559wjbTZNplNWbs-tiZEFv_VjBHZgzkGUfSRq6t1QwJKLNFGkA39_ZVmbTXK1EybjFBMg1-d-Vr0jt4rOfcqFWaPLVhSmRHa9N6GJXkTRAzEhifF5c_zIovsqqji8dBfZRrWf0vEhv-f1NkA",
        creator: "mrs. mochi",
        creator_url: ""
      },
      {
        title: "howls moving castle theme",
        data: "1XQAAAAIpAwAAAAAAAABBqEgrk25mdXzARVbtapZW986DZZtYttx8ir-MGC-6SqlbTq-nmMZXDGCZ1JZTuc1NVu6w_cEo_9ZLcmx4hmiThuuGSUAhUEd8wN2vXChn-fdBCIytdXeFGjdFR3uTw3mxaoy47vOphKkorBbx1hRNqwUCVPWRsGydrd9NdHOqfoR1ykorsyeTN9wK8jPRfWbomf2zU92OGRd0apH_AlHZEVUWFAUIzq3RAPRNN3nnPosc_WmYNnalKVBO22opZWZ_GBA8Zi5JSTxfPnoJtu_377yOY7noL_u2tLGLQIu89jC8Yf5xzGEC3U8PE79of_L-lfRrTPbLf2sSUKs3NpN__I8rOm4DtVPOpFftiSLekge9jTM6xQIwNm14qNQFDQ8Td9OjrPzui-LQWGt8OPSKTC3iDC0H4u03wWTnAZ5EPKsHecTFjnBRhNR4PCbwojDL_pWB7r7vPysk024rGtzQ-vsXeALWQucoq5deaftQmcoJddIrOKP36A54EneayRydkfZe027ykYGPzNCxdqb3ZJ4w_z6ivrknLmSOobMKp0GKOmLiftbpBitec5fByavTpHJtchIteuNACQj1m_tH1MFBKsZYyFmCLlR7mmsHhTjDURzM-hwrjqBEfdhqBKKDqH_Qu7lg_yoZeAA",
        creator: "mrs. mochi",
        creator_url: ""
      },
      {
        title: "Bicycle Theme (Pokemon Red & Blue)",
        data: "1XQAAAAJqAgAAAAAAAABBqEgtkRmZqLo7R713RjtaTATitVgKtAGUZKMmocqGJKIMWiXzkOssDUNcmBwmZU7KR8RXbtodywEAIaLcbI5ku2Cv8aorq0d9lqYlpKV2fpXMAaIkrIuWk98Zb0DgWyS8fly7LpnM0zRGd9ByLjWXoDal_BCuIgl_a2-rq3w0wuDuzYMhhknBWR90o4rMm2EqjtgnrmvSJymrTR1OLcjMXnmDeo_vL0ZPyEYV95NueC2_UBlc6zIwTaGSY0Nc90-pNrNJ30XiFwy8ShCfxmzivwCMmWvw99K8etVvUQYXaPsZMHxhNxJiETEZ8USxRxqlXRIE90bxBUgL5X7gnqzsBuWuBecJ6_HxOojCfR4aFSyshWZch6JPz46Xmorgv7gbspFByglbzj9_7Vhe49ig6PgdiYe55dPy3lAq55Y55YfZKWIuS-p8wYGWaTDHPEfdlr1nJ2cG2-W5I58LshaWZOyNHiPJZItxFvFc53uUhH8hFsIw5C2K6N-dPKyRJWFiQ2ivCvdEiKHcp8Fmn0Nc4xRmPeUW62GydzH_xLDBhQ",
        creator: "@StevenBraun0",
        creator_url: "https://twitter.com/StevenBraun0"
      }
    ];
  }

  render() {
    this.element.innerHTML = `
      <h2 class="browse__title">Featured Songs</h2>
      <div class="browse__songs">
        <ul id="featured-songs" class="library-songs">
          ${this.featuredSongs.map(song => (`
            <li class="library-song">
              <a href="#${song.data}">${song.title}</a> by ${renderSongCreator(song)}
            </li>
          `)).join('')}
        </ul>
      </div>
    `;

    const songsListEl = this.element.querySelector('#featured-songs');
    songsListEl && songsListEl.addEventListener('click', jumpToTopIfASongWasClicked);
  }
}
