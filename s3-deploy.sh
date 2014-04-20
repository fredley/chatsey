#!/usr/bin/env bash
 
assets='remote'
echo "Deploying: $assets"
 
s3cmd sync --force --reduced-redundancy --acl-public $assets s3://chatsey
