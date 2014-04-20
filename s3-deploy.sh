#!/usr/bin/env bash
 
assets='remote builds'
echo "Deploying: $assets"
 
s3cmd sync --force --reduced-redundancy --acl-public $assets s3://chatsey
