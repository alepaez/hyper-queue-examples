#!/bin/bash

docker run --network=host -v $(pwd)/targets.txt:/targets.txt \
       -v $(pwd)/body.json:/body.json \
       --rm -i peterevans/vegeta \
       sh -c "vegeta attack -rate=15 -duration=30s -targets=/targets.txt | vegeta report"

