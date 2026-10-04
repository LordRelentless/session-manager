#!/bin/bash
# $ bash build.sh outdir gaid rbid [chrome|firefox-mv2|firefox-mv3]

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR="$1"
GAID="$2"
RBID="$3"
TARGET="${4:-chrome}"

rm -rf "$OUTDIR"
cp -R "$SRCDIR" "$OUTDIR"
cd "$OUTDIR"

rm build.sh
rm -rf .git

case "$TARGET" in
	chrome)
		rm -rf manifests
		rm js/analytics-stub.js
		;;
	firefox-mv2)
		cp manifests/firefox-mv2.json manifest.json
		rm -rf manifests
		rm js/analytics.js
		;;
	firefox-mv3)
		cp manifests/firefox-mv3.json manifest.json
		rm -rf manifests
		rm js/analytics.js
		;;
	*)
		echo "Unknown target: $TARGET" >&2
		exit 1
		;;
esac

if [[ -f js/analytics.js ]]; then
	sed -i.bak -e "s/##GAID##/$GAID/" js/analytics.js
	rm js/analytics.js.bak
fi

if [[ -f js/errors.js ]]; then
	sed -i.bak -e "s/##RBID##/$RBID/" js/errors.js
	rm js/errors.js.bak
fi

find . -path '*/.*' -prune -o -type f -print | zip session-manager.zip -@