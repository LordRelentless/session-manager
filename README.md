Download the upload-ready extension packages:

- [Chrome MV3](dist/session-manager-chrome-mv3.zip)
- [Firefox MV2](dist/session-manager-firefox-mv2.zip)
- [Firefox MV3](dist/session-manager-firefox-mv3.zip)

To rebuild them, use `bash build.sh outdir - - chrome-mv3`,
`bash build.sh outdir - - firefox-mv2`, or
`bash build.sh outdir - - firefox-mv3`. Firefox and Chrome packages disable
remote analytics. The ZIPs are unsigned: Firefox AMO and the Chrome Web Store
apply their store signatures after upload.

---

© 2016 [Teddy Cross](https://teddy.io), © 2026 K.J. Martin, shared under the [MIT license](https://opensource.org/licenses/MIT).

Note: Attempting to load either MV2 or MV3 version presently kicks a corruption error in Firefox, I'm looking into this. 
